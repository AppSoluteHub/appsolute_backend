import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../../utils/prisma";
import {
  DuplicateError,
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../lib/appError";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Topics for theory questions
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
  "design patterns",
];

// const generateQuestion = async () => {
//   const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
//   const randomSeed = Math.floor(Math.random() * 100000);

//   const prompt = `
// Generate a unique THEORY (open-ended) technical question about ${randomTopic}.
// The question must require explanation or reasoning (no multiple-choice).

// Return JSON ONLY:

// {
//   "question": "string",
//   "modelAnswer": "string"
// }

// Rules:
// - "question" must be something a user writes 2–5 sentences to answer.
// - "modelAnswer" must be a factual expert-level explanation.
// - DO NOT include options or correctAnswer.
// Random seed: ${randomSeed}
//   `;

//   try {
//     const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
//       input: {
//         prompt,
//         max_tokens: 512,
//         temperature: 0.9,
//         top_p: 0.95,
//         seed: randomSeed,
//       },
//     });

//     const text = Array.isArray(output) ? output.join("") : String(output);
//     const cleanText = text.replace(/```json|```/g, "").trim();

//     const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
//     const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);

//     if (!parsed.question || !parsed.modelAnswer) {
//       throw new InternalServerError(
//         "AI response missing required theory-question fields."
//       );
//     }

//     return parsed;
//   } catch (err: any) {
//     throw new InternalServerError(
//       "Invalid question format from AI: " + err.message
//     );
//   }
// };
const generateQuestion = async (): Promise<{ question: string; modelAnswer: string }> => {
  const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
  const randomSeed = Math.floor(Math.random() * 100000);
  const MAX_MODEL_ANSWER_LENGTH = 1000; // adjust as needed

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

    // Clean the text
    text = text.replace(/```json|```/g, "")
               .replace(/\r?\n/g, " ")
               .trim();

    // Extract JSON object
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

    // Truncate extremely long modelAnswer to avoid parsing issues
    if (parsed.modelAnswer.length > MAX_MODEL_ANSWER_LENGTH) {
      parsed.modelAnswer = parsed.modelAnswer.slice(0, MAX_MODEL_ANSWER_LENGTH);
    }

    return parsed;
  };

  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callAI();
    } catch (err :any) {
      console.warn(`AI JSON parsing failed on attempt ${attempt}:`, err.message);
      lastError = err;
    }
  }

  throw new InternalServerError(
    `AI failed to generate a valid question after 3 attempts: ${lastError.message}`
  );
};

export const fetchForDisplay = async (number: number) => {
  let quizQuestion = await prisma.quizQuestion.findUnique({
    where: { number },
  });

  if (quizQuestion) {
    if (quizQuestion.answeredByUserId) {
      throw new DuplicateError(
        `Question number ${number} has already been answered.`
      );
    }
    return quizQuestion;
  }

  // Generate new theory question
  const generated = await generateQuestion();

  quizQuestion = await prisma.quizQuestion.create({
    data: {
      number,
      question: generated.question,
      modelAnswer: generated.modelAnswer,
      answeredByUserId: null,
    },
  });

  return quizQuestion;
};

export const attemptQuestion = async (
  number: number,
  userAnswer: string,
  userId: string
) => {
  if (typeof userAnswer !== "string") {
    throw new BadRequestError("User answer must be a string.");
  }

  const quizConfig = await prisma.quizConfig.findUnique({ where: { id: 1 } });
  if (!quizConfig) {
    throw new InternalServerError(
      "Quiz configuration not found. Please contact admin."
    );
  }

  // Retrieve score
  let scoreRecord = await prisma.score.findUnique({ where: { userId } });
  const currentCorrectAnswers = scoreRecord ? scoreRecord.score : 0;

  // Count attempts
  const userAttempts = await prisma.quizQuestion.count({
    where: { answeredByUserId: userId },
  });

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
    where: { number },
  });

  if (!quizQuestion) {
    throw new NotFoundError(`Question number ${number} not found.`);
  }

  if (quizQuestion.answeredByUserId) {
    if (quizQuestion.answeredByUserId === userId) {
      throw new DuplicateError("You have already answered this question.");
    }
    throw new ForbiddenError(
      `Question number ${number} has already been answered by another user.`
    );
  }

  let correct = false;

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
  "feedback": "short explanation"
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

    const validationText = Array.isArray(result)
      ? result.join("")
      : String(result);

    const clean = validationText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.isCorrect !== "boolean") {
      throw new Error("AI returned invalid format.");
    }

    correct = parsed.isCorrect;
  } catch (err) {
    console.error("AI validation failed:", err);
    throw new InternalServerError("Failed to validate answer.");
  }

  // Mark as answered
  await prisma.quizQuestion.update({
    where: { id: quizQuestion.id },
    data: { answeredByUserId: userId },
  });

  // Update score
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

  // Attempts after update
  const updatedUserAttempts = await prisma.quizQuestion.count({
    where: { answeredByUserId: userId },
  });

  const qualifiedForSpin =
    scoreRecord.score >= quizConfig.correctAnswersForSpin;

  const trialsRemaining = Math.max(
    0,
    quizConfig.trials - updatedUserAttempts
  );

  let message = "";
  if (qualifiedForSpin) {
    message = "Congratulations! You qualify to spin the wheel.";
  } else if (trialsRemaining === 0) {
    message = `You have used all your trials.`;
  } else {
    message = `You need ${
      quizConfig.correctAnswersForSpin - scoreRecord.score
    } more correct answers to qualify. ${trialsRemaining} trials remaining.`;
  }

  return {
    success: true,
    correct,
    userScore: scoreRecord.score,
    qualifiedForSpin,
    trialsRemaining,
    message,
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
