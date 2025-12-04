
import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../../utils/prisma";
import { DuplicateError, InternalServerError, NotFoundError, ForbiddenError, BadRequestError } from "../../lib/appError";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, 
});


const techTopics = [
  "data structures",
  "algorithms",
  "web development",
  "databases",
  "cloud computing",
  "cybersecurity",
  "machine learning",
  "DevOps",
  "programming languages",
  "software architecture",
  "API design",
  "mobile development",
  "networking",
  "version control",
  "testing and QA",
  "operating systems",
  "containerization",
  "microservices",
  "blockchain",
  "design patterns"
];

const generateQuestion = async () => {
  // Add randomization for variety
  const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
  const randomSeed = Math.floor(Math.random() * 100000);
  const timestamp = Date.now();
  
  const prompt = `Generate a unique multiple-choice question about ${randomTopic} with 4 options and a single correct answer. Make it different from common questions. Format the output as a JSON object with three fields: "question", "options" (an array of strings), and "correctAnswer" (the text of the correct option).

Example format:
{
  "question": "Which data structure uses LIFO (Last In, First Out) principle?",
  "options": ["Queue", "Stack", "Tree", "Graph"],
  "correctAnswer": "Stack"
}

Random seed for variety: ${randomSeed}
Generate a NEW and DIFFERENT question. Return ONLY the JSON object, no additional text.`;

  try {
    const output = await replicate.run(
      "meta/meta-llama-3-70b-instruct",
      {
        input: {
          prompt: prompt,
          max_tokens: 512,
          temperature: 0.9, // from 0.7 for more variety
          top_p: 0.95, // for randomness
          seed: randomSeed, 
        },
      }
    );

    const text = Array.isArray(output) ? output.join("") : String(output);
    
    const cleanText = text
      .replace(/```json\n?|\n?```/g, "")
      .replace(/```\n?|\n?```/g, "")
      .trim();

    // Extract JSON in case there's extra text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : cleanText;

    const parsed = JSON.parse(jsonText);

    if (
      !parsed.question ||
      !parsed.options ||
      !Array.isArray(parsed.options) ||
      !parsed.correctAnswer
    ) {
      throw new InternalServerError(
        "AI response missing required fields or has invalid options format."
      );
    }
    
    return parsed;
  } catch (error: any) {
    console.error("Failed to generate question with Replicate:", error);
    throw new InternalServerError("Invalid question format from AI: " + error.message);
  }
};

export const fetchForDisplay = async (number: number) => {
  let quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number: number },
  });

  if (quizQuestion) {
    if (quizQuestion.answeredByUserId) {
      throw new DuplicateError(`Question number ${number} has already been answered.`);
    }
    return quizQuestion;
  } else {
    // Question doesn't exist, generate a new one
    const generated = await generateQuestion();
    
    quizQuestion = await prisma.quizQuestion.create({
      data: {
        number: number,
        question: generated.question,
        options: generated.options,
        correctAnswer: generated.correctAnswer,
        answeredByUserId: null,
      },
    });
    return quizQuestion;
  }
};

export const attemptQuestion = async (
  number: number,
  userAnswer: string,
  userId: string
) => {
  if (typeof userAnswer !== 'string') {
    throw new BadRequestError("User answer must be a string.");
  }


  const quizConfig = await prisma.quizConfig.findUnique({ where: { id: 1 } });
  if (!quizConfig) {
    throw new InternalServerError("Quiz configuration not found. Please set it via the admin panel.");
  }

  //  Retrieve User Score and Count User Attempts
  let scoreRecord = await prisma.score.findUnique({
    where: { userId },
  });
  const currentCorrectAnswers = scoreRecord ? scoreRecord.score : 0;

  const userAttempts = await prisma.quizQuestion.count({
    where: { 
      answeredByUserId: userId 
    },
  });

  // Check Trial Limit (before processing the current question)
  // If the user has already reached or exceeded the trial limit
  if (userAttempts >= quizConfig.trials) {
    return {
      success: false,
      message: `You have used all your ${quizConfig.trials} trials.`,
      qualifiedForSpin: false,
      trialsRemaining: 0,
      userScore: currentCorrectAnswers,
    };
  }

  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number: number },
  });

  if (!quizQuestion) {
    throw new NotFoundError(`Question number ${number} not found.`);
  }

  if (quizQuestion.answeredByUserId) {
    if (quizQuestion.answeredByUserId === userId) {
      throw new DuplicateError("You have already answered this question.");
    } else {
      throw new ForbiddenError(
        `Question number ${number} has already been answered by another user.`
      );
    }
  }

  // Process the current attempt
  let correct: boolean;
  try {
    const validationPrompt = `Given the following multiple-choice question, options, the user's answer, and the actual correct answer, determine if the user's answer is semantically or logically correct.
Return a JSON object with a single boolean field "isCorrect".

Question: ${quizQuestion.question}
Options: ${JSON.stringify(quizQuestion.options)}
User Answer: ${userAnswer}
Actual Correct Answer: ${quizQuestion.correctAnswer}

Is the User Answer correct?`;

    const validationOutput = await replicate.run(
      "meta/meta-llama-3-70b-instruct",
      {
        input: {
          prompt: validationPrompt,
          max_tokens: 100, // Small output expected
          temperature: 0.1, // Focus on accuracy
          top_p: 0.9,
        },
      }
    );

    const validationText = Array.isArray(validationOutput) ? validationOutput.join("") : String(validationOutput);
    const cleanValidationText = validationText.replace(/```json\n?|\n?```/g, "").trim();
    const validationParsed = JSON.parse(cleanValidationText);

    if (typeof validationParsed.isCorrect !== 'boolean') {
      throw new Error("Replicate did not return a valid boolean for isCorrect.");
    }
    correct = validationParsed.isCorrect;

  } catch (error: any) {
    console.error("Failed to validate answer with Replicate:", error);
    // Fallback to direct comparison or throw an error if AI validation is critical
    console.warn("Falling back to direct comparison for answer validation due to Replicate error.");
    correct = userAnswer.trim().toLowerCase() === quizQuestion.correctAnswer!.trim().toLowerCase();
  }

  await prisma.quizQuestion.update({
    where: { id: quizQuestion.id },
    data: { answeredByUserId: userId },
  });

  // Update user's score based on current attempt
  if (!scoreRecord) {
    scoreRecord = await prisma.score.create({
      data: {
        userId,
        score: correct ? 1 : 0,
      },
    });
  } else if (correct) {
    scoreRecord = await prisma.score.update({
      where: { userId },
      data: { score: scoreRecord.score + 1 },
    });
  }
  
  // Re-calculate userAttempts after this current attempt has been processed
  const updatedUserAttempts = await prisma.quizQuestion.count({
    where: { 
      answeredByUserId: userId 
    },
  });

  const qualifiedForSpin = scoreRecord.score >= quizConfig.correctAnswersForSpin;
  const trialsRemaining = Math.max(0, quizConfig.trials - updatedUserAttempts);

  let message = '';
  if (qualifiedForSpin) {
    message = "Congratulations! You qualify to spin the wheel.";
  } else if (trialsRemaining === 0) {
    message = `You have used all your trials. You needed ${quizConfig.correctAnswersForSpin} correct answers to qualify, but only got ${scoreRecord.score}.`;
  } else {
    message = `You need ${quizConfig.correctAnswersForSpin - scoreRecord.score} more correct answers to qualify. ${trialsRemaining} trials remaining.`;
  }

  return {
    success: true,
    correct,
    userScore: scoreRecord.score,
    qualifiedForSpin: qualifiedForSpin,
    trialsRemaining: trialsRemaining,
    message: message,
  };
};

export const updateSpinConfig = async (trials: number, correctAnswersForSpin: number) => {
  const config = await prisma.quizConfig.upsert({
    where: { id: 1 },
    update: {
      trials,
      correctAnswersForSpin,
    },
    create: {
      id: 1, 
      trials,
      correctAnswersForSpin,
    },
  });
  return config;
};