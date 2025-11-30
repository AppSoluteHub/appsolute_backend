import { Request, Response } from 'express';
import { fetchForDisplay, attemptQuestion } from './service';

export const getQuestion = async (req: Request, res: Response) => {
  const number = Number(req.body.number);
  if (isNaN(number)) {
     res.status(400).json({ error: 'Invalid question number' });
     return
  }

  try {
    const question = await fetchForDisplay(number);
    if (!question) {
       res.status(404).json({ error: 'Question not found' });
       return
    }
    res.json(question);
  } catch (err) {
    console.error(err);
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
