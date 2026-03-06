import { z } from 'zod';

export const StartChatSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  deviceInfo: z.string().optional(),
});

export const SendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1),
});

export const ChatResponseSchema = z.object({
  reply: z.string(),
  recommendedProducts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    url: z.string(),
  })).optional(),
});

export type StartChatInput = z.infer<typeof StartChatSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
