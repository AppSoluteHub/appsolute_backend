import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { StartChatSchema, SendMessageSchema } from '../dto/chat.dto';

export const startChat = async (req: Request, res: Response) => {
  try {
    const validatedData = StartChatSchema.parse(req.body);
    const session = await chatService.startChatSession(validatedData);
    res.status(201).json({
      status: 'success',
      data: { session },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Invalid input',
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = SendMessageSchema.parse(req.body);
    const response = await chatService.processUserMessage(validatedData.sessionId, validatedData.message);
    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Something went wrong',
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatService.getSessionMessages(sessionId);
    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (error: any) {
    res.status(404).json({
      status: 'fail',
      message: error.message || 'Session not found',
    });
  }
};
