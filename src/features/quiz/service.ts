import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../../utils/prisma";
import { NLPHelper } from "../../utils/nlp.helper";
import {
  InternalServerError,
} from "../../lib/appError";

type QuizQuestionError = {
  success: false;
  message: string;
  aiStyle: boolean;
};

type QuizQuestionSuccess = {
  success: true;
  id: number;
  number: number;
  question: string;
  answeredByUserId: string | null;
  aiMessage?: string;
  generatedTopic?: string;
  aiStyle?: boolean;
  aiNote?: string;
};

type QuizQuestionResponse = QuizQuestionError | QuizQuestionSuccess;

// Attempt response types
type AttemptResponse = {
  success: boolean;
  correct?: boolean;
  userScore?: number;
  qualifiedForSpin?: boolean;
  trialsRemaining?: number;
  message: string;
  aiFeedback?: string;
  aiStyle: boolean;
};

// Type guard helper
export function isQuizError(response: QuizQuestionResponse): response is QuizQuestionError {
  return !response.success;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});



const techTopics = [
  "how computers work",
  "the internet and Wi-Fi",
  "smartphones and mobile devices",
  "mobile apps",
  "websites and browsers",
  "email and online communication",
  "files, folders, and storage",
  "cloud storage and backups",
  "passwords and online security",
  "social media",
  "online privacy",
  "search engines",
  "operating systems",
  "software installation",
  "computer viruses and malware",
  "artificial intelligence basics",
  "online safety and scams",
  "hardware vs software",
];


const generateQuestion = async (): Promise<{ question: string; modelAnswer: string; topic: string }> => {
  const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
  const randomSeed = Math.floor(Math.random() * 100000);
  const MAX_MODEL_ANSWER_LENGTH = 1000;

const prompt = `
Generate a unique,GENERAL TECHNOLOGY question about "${randomTopic}".

The question must be suitable for everyday computer or smartphone users
and should NOT require programming or coding knowledge.

The answer should be understandable by a non-technical person
and explain the idea in 1–3 short sentences.

Return JSON ONLY:

{
  "question": "string",
  "modelAnswer": "string"
}

Rules:
- Do NOT ask about programming, coding, or software development.
- Do NOT use technical jargon.
- "question" should sound like something a beginner would ask.
- "modelAnswer" must be short, clear, and practical (2–4 sentences max).
- NO multiple-choice questions.
- NO correctAnswer field.

Random seed: ${randomSeed}
`;


  const callAI = async () => {
    const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
      input: {
        prompt,
        max_tokens: 512,
        temperature: 0.9,
        top_p: 0.95,
        seed: randomSeed,
      },
    });

    let text = Array.isArray(output) ? output.join("") : String(output);
    text = text.replace(/```json|```/g, "").replace(/\r?\n/g, " ").trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in AI response.");

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      throw new Error("Failed to parse AI JSON: " + err);
    }

    if (!parsed.question || !parsed.modelAnswer) {
      throw new Error("AI JSON missing 'question' or 'modelAnswer' fields.");
    }

    if (parsed.modelAnswer.length > MAX_MODEL_ANSWER_LENGTH) {
      parsed.modelAnswer = parsed.modelAnswer.slice(0, MAX_MODEL_ANSWER_LENGTH);
    }

    return { ...parsed, topic: randomTopic };
  };

  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callAI();
    } catch (err: any) {
      console.warn(`AI JSON parsing failed on attempt ${attempt}:`, err.message);
      lastError = err;
    }
  }

  throw new InternalServerError(
    `AI failed to generate a valid question after 3 attempts: ${lastError.message}`
  );
};

export const fetchForDisplay = async (number: number): Promise<QuizQuestionResponse> => {
  let quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number },
  });

  if (quizQuestion) {
    if (quizQuestion.answeredByUserId) {
      // Return conversational error with explicit type
      const errorResponse: QuizQuestionError = {
        success: false,
        message: NLPHelper.generateConversationalMessage({
          type: 'already_answered',
          data: { number, byYou: false }
        }),
        aiStyle: true
      };
      return errorResponse;
    }
    
    // Return existing question without modelAnswer
    const { modelAnswer, ...questionWithoutAnswer } = quizQuestion;
    const successResponse: QuizQuestionSuccess = {
      success: true,
      ...questionWithoutAnswer
    };
    return successResponse;
  }

  // Generate new question with conversational feedback
  const generated = await generateQuestion();

  quizQuestion = await prisma.quizQuestion.create({
    data: {
      number,
      question: generated.question,
      modelAnswer: generated.modelAnswer,
      answeredByUserId: null,
    },
  });

  // Return without modelAnswer
  const { modelAnswer, ...questionWithoutAnswer } = quizQuestion;
  
  const successResponse: QuizQuestionSuccess = {
    success: true,
    ...questionWithoutAnswer,
    aiMessage: NLPHelper.generateConversationalMessage({
      type: 'question_ready'
    }),
    generatedTopic: generated.topic,
    aiStyle: true
  };
  
  return successResponse;
};

export const attemptQuestion = async (
  number: number,
  userAnswer: string,
  userId: string
): Promise<AttemptResponse> => {
  if (typeof userAnswer !== "string") {
    return {
      success: false,
      message: "I need your answer as text. Could you write out your response?",
      aiStyle: true
    };
  }

  const quizConfig = await prisma.quizConfig.findUnique({ where: { id: 1 } });
  if (!quizConfig) {
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'server_error'
      }),
      aiStyle: true
    };
  }

  let scoreRecord = await prisma.score.findUnique({ where: { userId } });
  const currentCorrectAnswers = scoreRecord ? scoreRecord.score : 0;

  // Count TOTAL attempts (both correct and incorrect)
  const totalAttempts = await prisma.quizQuestion.count({
    where: { answeredByUserId: userId },
  });

  // Check if user has exhausted all trials
  if (totalAttempts >= quizConfig.trials) {
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'trials_exhausted',
        data: {
          trials: quizConfig.trials,
          score: currentCorrectAnswers,
          qualified: currentCorrectAnswers >= quizConfig.correctAnswersForSpin
        }
      }),
      qualifiedForSpin: currentCorrectAnswers >= quizConfig.correctAnswersForSpin,
      trialsRemaining: 0,
      userScore: currentCorrectAnswers,
      aiStyle: true
    };
  }

  if (currentCorrectAnswers >= quizConfig.correctAnswersForSpin) {
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'qualified',
        data: { score: currentCorrectAnswers }
      }),
      qualifiedForSpin: true,
      trialsRemaining: 0, 
      userScore: currentCorrectAnswers,
      aiStyle: true
    };
  }

  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number },
  });

  if (!quizQuestion) {
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'invalid_input',
        data: { input: `question ${number}` }
      }),
      aiStyle: true
    };
  }

  if (quizQuestion.answeredByUserId) {
    const byYou = quizQuestion.answeredByUserId === userId;
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'already_answered',
        data: { number, byYou }
      }),
      aiStyle: true
    };
  }

  let correct = false;
  let aiFeedback = "";

  try {
    const validationPrompt = `
You are grading a THEORY (open-ended) answer.

Question: ${quizQuestion.question}
Model Answer: ${quizQuestion.modelAnswer}
User Answer: ${userAnswer}

Evaluate semantic correctness (not exact words).

Return ONLY JSON:

{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "short friendly explanation"
}
`;

    const result = await replicate.run("meta/meta-llama-3-70b-instruct", {
      input: {
        prompt: validationPrompt,
        max_tokens: 256,
        temperature: 0.1,
        top_p: 0.9,
      },
    });

    const validationText = Array.isArray(result) ? result.join("") : String(result);
    const clean = validationText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.isCorrect !== "boolean") {
      throw new Error("AI returned invalid format.");
    }

    correct = parsed.isCorrect;
    aiFeedback = parsed.feedback || "";
  } catch (err) {
    console.error("AI validation failed:", err);
    return {
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'validation_error'
      }),
      aiStyle: true
    };
  }

  // Mark question as answered by this user
  await prisma.quizQuestion.update({
    where: { id: quizQuestion.id },
    data: { answeredByUserId: userId },
  });

  // Update score record AND user model
  if (!scoreRecord) {
    // Create new score record
    scoreRecord = await prisma.score.create({
      data: { userId, score: correct ? 1 : 0 },
    });
  } else if (correct) {
    // Update score record
    scoreRecord = await prisma.score.update({
      where: { userId },
      data: { score: scoreRecord.score + 1 },
    });
  }

  // Update User model with total score and answered count
  if (correct) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalScore: { increment: 1 }, // Increment totalScore by 1
        answered: { increment: 1 }     // Increment answered count by 1
      }
    });
  } else {
    // Still increment answered count even if wrong
    await prisma.user.update({
      where: { id: userId },
      data: {
        answered: { increment: 1 }
      }
    });
  }

  // Recalculate attempts after this answer
  const updatedTotalAttempts = totalAttempts + 1;
  const updatedCorrectAnswers = scoreRecord.score;
  
  // Check qualification
  const qualifiedForSpin = updatedCorrectAnswers >= quizConfig.correctAnswersForSpin;
  
  const trialsRemaining = qualifiedForSpin 
    ? 0 
    : Math.max(0, quizConfig.trials - updatedTotalAttempts);

  // Generate appropriate message
  let message = "";
  
  if (qualifiedForSpin) {
    message = NLPHelper.generateConversationalMessage({
      type: 'qualified',
      data: { score: updatedCorrectAnswers }
    });
  } else if (correct) {
    message = NLPHelper.generateConversationalMessage({
      type: 'correct',
      data: {
        score: updatedCorrectAnswers,
        trials: quizConfig.trials,
        remaining: trialsRemaining,
        qualified: qualifiedForSpin
      }
    });
  } else {
    message = NLPHelper.generateConversationalMessage({
      type: 'incorrect',
      data: {
        score: updatedCorrectAnswers,
        trials: quizConfig.trials,
        remaining: trialsRemaining,
        feedback: aiFeedback
      }
    });
  }

  // If not qualified and still has trials, show progress
  if (!qualifiedForSpin && trialsRemaining > 0) {
    const needed = quizConfig.correctAnswersForSpin - updatedCorrectAnswers;
    if (needed > 0) {
      message = NLPHelper.generateConversationalMessage({
        type: 'need_more',
        data: {
          needed,
          score: updatedCorrectAnswers,
          remaining: trialsRemaining
        }
      });
    }
  }

  return {
    success: true,
    correct,
    userScore: updatedCorrectAnswers,
    qualifiedForSpin,
    trialsRemaining,
    message,
    aiFeedback,
    aiStyle: true
  };
};
export const updateSpinConfig = async (
  trials: number,
  correctAnswersForSpin: number
) => {
  return prisma.quizConfig.upsert({
    where: { id: 1 },
    update: { trials, correctAnswersForSpin },
    create: { id: 1, trials, correctAnswersForSpin },
  });
};
