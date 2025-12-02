import { Request, Response } from 'express';
import { fetchForDisplay, attemptQuestion, seedQuestions, updateQuizConfig, getQuizConfig } from './service';
import {  DuplicateError } from '../../lib/appError';

export const getQuestion = async (req: Request, res: Response) => {
  const number = Number(req.body.number);
  if (!number) {
    res.status(400).json({ error: 'Question number is required' });
    return;
  }
  
   if (isNaN(number)) {
    res.status(400).json({ error: 'Invalid question number' });
    return;
  }

  try {
    const question = await fetchForDisplay(number);

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json(question);
  } catch (err: any) {
   if (err instanceof DuplicateError) {
   res.status(409).json({ error: err.message });
   return;
}

    res.status(500).json({ error: 'Server error' });
  }
};


// Controller to attempt a question
export const postAttempt = async (req: Request, res: Response) => {
  const number = Number(req.params.number);
  const { userAnswer, userId } = req.body;
  
  if (!userAnswer || !userId) {
     res.status(400).json({ error: 'Missing userAnswer or userId' });
     return
  }

  if (isNaN(number)) {
     res.status(400).json({ error: 'Invalid question number' });
     return
  }

  try {
    const result = await attemptQuestion(number, userAnswer, userId);
    if (!result.success) {
       res.status(400).json({ error: result.error });
       return
    }
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const seedQuizQuestions = async (req: Request, res: Response) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
     res.status(400).json({ error: 'Invalid request body, expecting a "questions" array' });
     return
  }

  try {
    const result = await seedQuestions(questions);
    res.status(201).json({ message: 'Questions seeded successfully', count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const configureQuiz = async (req: Request, res: Response) => {
  const { trials, correctAnswersForSpin } = req.body;

  if (trials === undefined && correctAnswersForSpin === undefined) {
     res.status(400).json({ error: 'No configuration provided' });
      return;
  }

  try {
    const newConfig = await updateQuizConfig({ trials, correctAnswersForSpin });
    res.json({ message: 'Quiz configuration updated', newConfig });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getConfiguration = async (req: Request, res: Response) => {
  try {
    const config = await getQuizConfig();
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
