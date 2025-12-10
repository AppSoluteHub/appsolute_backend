import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../../utils/prisma";
import { NLPHelper } from "../../utils/nlp.helper";
import {
  DuplicateError,
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../lib/appError";

// Type definitions with proper literal types
type QuizQuestionError = {
  error: true;  
  message: string;
  aiStyle: boolean;
};

type QuizQuestionSuccess = {
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

// Type guard helper
export function isQuizError(response: QuizQuestionResponse): response is QuizQuestionError {
  return 'error' in response && response.error === true;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const techTopics = [
  "data structures", "algorithms", "web development", "databases",
  "cloud computing", "cybersecurity", "machine learning", "DevOps",
  "programming languages", "software architecture", "API design",
  "mobile development", "networking", "version control", "testing and QA",
  "operating systems", "containerization", "microservices", "blockchain",
  "design patterns",
];

const generateQuestion = async (): Promise<{ question: string; modelAnswer: string; topic: string }> => {
  const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
  const randomSeed = Math.floor(Math.random() * 100000);
  const MAX_MODEL_ANSWER_LENGTH = 1000;

  const prompt = `
Generate a unique THEORY (open-ended) technical question about ${randomTopic}.
The question must require explanation or reasoning (no multiple-choice).

Return JSON ONLY:

{
  "question": "string",
  "modelAnswer": "string"
}

Rules:
- "question" must be something a user writes 2–5 sentences to answer.
- "modelAnswer" must be a factual expert-level explanation.
- DO NOT include options or correctAnswer.
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
        error: true,  // Now TypeScript knows this is literally 'true'
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
    return questionWithoutAnswer;
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
) => {
  if (typeof userAnswer !== "string") {
    throw new BadRequestError("I need your answer as text. Could you write out your response?");
  }

  const quizConfig = await prisma.quizConfig.findUnique({ where: { id: 1 } });
  if (!quizConfig) {
    throw new InternalServerError(
      "Quiz configuration not found. Please contact admin."
    );
  }

  let scoreRecord = await prisma.score.findUnique({ where: { userId } });
  const currentCorrectAnswers = scoreRecord ? scoreRecord.score : 0;

  const userAttempts = await prisma.quizQuestion.count({
    where: { answeredByUserId: userId },
  });

  if (userAttempts >= quizConfig.trials) {
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

  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number },
  });

  if (!quizQuestion) {
    throw new NotFoundError(`Question number ${number} not found.`);
  }

  if (quizQuestion.answeredByUserId) {
    const byYou = quizQuestion.answeredByUserId === userId;
    throw new DuplicateError(
      NLPHelper.generateConversationalMessage({
        type: 'already_answered',
        data: { number, byYou }
      })
    );
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
    throw new InternalServerError("Failed to validate answer.");
  }

  await prisma.quizQuestion.update({
    where: { id: quizQuestion.id },
    data: { answeredByUserId: userId },
  });

  if (!scoreRecord) {
    scoreRecord = await prisma.score.create({
      data: { userId, score: correct ? 1 : 0 },
    });
  } else if (correct) {
    scoreRecord = await prisma.score.update({
      where: { userId },
      data: { score: scoreRecord.score + 1 },
    });
  }

  const updatedUserAttempts = await prisma.quizQuestion.count({
    where: { answeredByUserId: userId },
  });

  const qualifiedForSpin = scoreRecord.score >= quizConfig.correctAnswersForSpin;
  const trialsRemaining = Math.max(0, quizConfig.trials - updatedUserAttempts);

  let message = "";
  if (qualifiedForSpin) {
    message = NLPHelper.generateConversationalMessage({
      type: 'qualified',
      data: { score: scoreRecord.score }
    });
  } else if (correct) {
    message = NLPHelper.generateConversationalMessage({
      type: 'correct',
      data: {
        score: scoreRecord.score,
        trials: quizConfig.trials,
        remaining: trialsRemaining,
        qualified: qualifiedForSpin
      }
    });
  } else {
    message = NLPHelper.generateConversationalMessage({
      type: 'incorrect',
      data: {
        score: scoreRecord.score,
        trials: quizConfig.trials,
        remaining: trialsRemaining,
        feedback: aiFeedback
      }
    });
  }

  if (!qualifiedForSpin && trialsRemaining > 0) {
    const needed = quizConfig.correctAnswersForSpin - scoreRecord.score;
    if (needed > 0) {
      message = NLPHelper.generateConversationalMessage({
        type: 'need_more',
        data: {
          needed,
          score: scoreRecord.score,
          remaining: trialsRemaining
        }
      });
    }
  }

  return {
    success: true,
    correct,
    userScore: scoreRecord.score,
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