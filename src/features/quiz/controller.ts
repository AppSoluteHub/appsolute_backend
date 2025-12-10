import { Request, Response } from "express";
import { fetchForDisplay, attemptQuestion, updateSpinConfig, isQuizError } from "./service";
import {  UnAuthorizedError } from "../../lib/appError";
import { catchAsync } from "../../utils/catchAsync";
import { NLPHelper } from "../../utils/nlp.helper";

export const getQuestion = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new UnAuthorizedError("User not authorized, please login");
  }

  const rawInput = req.body.number;
  
  // Parse natural language input
  const parsed = NLPHelper.parseQuestionNumber(String(rawInput));
  
  if (!parsed.number) {
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'invalid_input',
        data: { input: rawInput }
      }),
      aiStyle: true,
      suggestion: "Try: '5', 'five', 'question 5', or 'number five'"
    });
    return;
  }

  if (parsed.number < 1 || parsed.number > 100) {
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'range_error',
        data: { number: parsed.number }
      }),
      aiStyle: true
    });
    return;
  }

  try {
    const question = await fetchForDisplay(parsed.number);
    
    if (isQuizError(question)) {
      res.status(200).json(question);
      return;
    }

    const response: any = { 
      ...question 
    };
    
    if (parsed.confidence === 'medium' || parsed.confidence === 'low') {
      response.aiNote = NLPHelper.generateConversationalMessage({
        type: 'uncertain_parse',
        data: { number: parsed.number, input: rawInput }
      });
    }

    res.status(200).json(response);
  } catch (err: any) {
    console.error(err);
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'server_error'
      }),
      aiStyle: true,
      // technical: err.message 
    });
  }
});

export const postAttempt = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnAuthorizedError("User not authorized, please login");
  }

  const rawNumber = req.params.number;
  
  // Parse question number with NLP
  const parsed = NLPHelper.parseQuestionNumber(String(rawNumber));
  
  if (!parsed.number || parsed.number < 1 || parsed.number > 100) {
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: parsed.number && (parsed.number < 1 || parsed.number > 100) 
          ? 'range_error' 
          : 'invalid_input',
        data: { input: rawNumber, number: parsed.number }
      }),
      aiStyle: true
    });
    return;
  }

  const { userAnswer } = req.body;
  
  if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'missing_answer'
      }),
      aiStyle: true
    });
    return;
  }

  const wordCount = userAnswer.trim().split(/\s+/).length;
  if (wordCount < 5) {
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'short_answer'
      }),
      aiStyle: true,
      suggestion: "Aim for 2-5 sentences"
    });
    return;
  }

  try {
    const result = await attemptQuestion(parsed.number, userAnswer, userId);
  
    console.log(result);
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Unexpected error:', err);
    res.status(200).json({
      success: false,
      message: NLPHelper.generateConversationalMessage({
        type: 'server_error'
      }),
      aiStyle: true,
      technical: err.message // Keep for debugging
    });
  }
});

export const updateQuizConfig = catchAsync(async (req: Request, res: Response) => {
  const { trials, correctAnswersForSpin } = req.body;
  
  if (typeof trials !== 'number' || trials <= 0 || !Number.isInteger(trials)) {
    res.status(200).json({
      success: false,
      message: "Trials must be a positive integer. Give me a whole number greater than 0!",
      aiStyle: true
    });
    return;
  }
  
  if (typeof correctAnswersForSpin !== 'number' || correctAnswersForSpin <= 0 || !Number.isInteger(correctAnswersForSpin)) {
    res.status(200).json({
      success: false,
      message: "Correct answers for spin must be a positive integer. Give me a whole number greater than 0!",
      aiStyle: true
    });
    return;
  }
  
  const config = await updateSpinConfig(trials, correctAnswersForSpin);
  
  res.status(200).json({
    success: true,
    data: config,
    message: `Quiz config updated! Players now get ${trials} trials and need ${correctAnswersForSpin} correct answers to spin the wheel. 🎡`
  });
});
