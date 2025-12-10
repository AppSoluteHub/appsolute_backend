import { Request, Response } from "express";
import { fetchForDisplay, attemptQuestion, updateSpinConfig } from "./service";
import { BadRequestError, InternalServerError, UnAuthorizedError } from "../../lib/appError";
import { catchAsync } from "../../utils/catchAsync";

const validateNumber = (value: any): string | null => {
  if (value === undefined || value === null || value === '') {
    return 'Question number is required, ensure is a valid number (1-100)';
  }

  const num = Number(value);

  if (isNaN(num)) {
    return 'Question number is required, ensure is a valid number (1-100)';
  }

  if (num < 1 || num > 100) {
    return 'Question number must be between 1 and 100';
  }

  return null;
};



export const getQuestion = catchAsync(async (req: Request, res: Response) => {

if (!req.user?.id) {
  throw new UnAuthorizedError("User not authorized, please login");
}

const number = Number(req.params.number);

if (isNaN(number)) {
  throw new BadRequestError("Invalid number parameter");
}

const error = validateNumber(number);
if (error) {
  throw new BadRequestError(error);
}

const question = await fetchForDisplay(number);
  const { modelAnswer, ...safe } = question;
  res.json(safe);
});

export const postAttempt = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if(!userId){
    throw new UnAuthorizedError("User not authorized, please login");
  }
  const number = Number(req.params.number);
  const error = validateNumber(number);
  if (error) {
    throw new BadRequestError(error);
  }

  const { userAnswer } = req.body;

  if (!userAnswer ) {
    throw new BadRequestError("Missing userAnswer,please provide an answer to proceed.");
  }

  const result = await attemptQuestion(number, userAnswer, userId); 
  if (!result.success) {
    throw new InternalServerError("Failed to attempt question");
  }
  console.log(result);
  res.json(result);
});

export const updateQuizConfig = catchAsync(async (req: Request, res: Response) => {
  const { trials, correctAnswersForSpin } = req.body;

  if (typeof trials !== 'number' || trials <= 0 || !Number.isInteger(trials)) {
    throw new BadRequestError("Trials must be a positive integer.");
  }

  if (typeof correctAnswersForSpin !== 'number' || correctAnswersForSpin <= 0 || !Number.isInteger(correctAnswersForSpin)) {
    throw new BadRequestError("Correct answers for spin must be a positive integer.");
  }

  const config = await updateSpinConfig(trials, correctAnswersForSpin);
  res.status(200).json({
    status: 'success',
    data: config,
  });
});
