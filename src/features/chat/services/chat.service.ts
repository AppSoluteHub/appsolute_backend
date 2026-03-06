import { PrismaClient, ChatRole } from '@prisma/client';
import OpenAI from 'openai';
import env from '../../../config/env';
import { AppError, BadRequestError } from '../../../lib/appError';
import { ChatResponse, ChatResponseSchema } from '../dto/chat.dto';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: env.openai_api_key,
});


export const startChatSession = async (data: { email: string; fullName: string; deviceInfo?: string }) => {
  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
      },
    });
  } else if (!user.fullName && data.fullName) {
    user = await prisma.user.update({
      where: { email: data.email },
      data: { fullName: data.fullName },
    });
  }
 
  const session = await prisma.chatSession.create({
    data: {
      userId: user.id,
      deviceInfo: data.deviceInfo,
    },
  });

  return session;
};

export const getSessionMessages = async (sessionId: string) => {
  return await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
};

export const processUserMessage = async (sessionId: string, userMessage: string): Promise<ChatResponse> => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 15 } },
  });

  if (!session) {
    throw new BadRequestError('Chat session not found', 404);
  }

  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: ChatRole.USER,
      content: userMessage,
    },
  });

  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    take: 5, 
  });

  const products = await prisma.product.findMany({
    where: { 
      isActive: true,
      stock: { gt: 0 }
    },
    take: 10, 
  });

 
  const systemPrompt = `
    You are a helpful customer support assistant for AppSolute.
    Your goal is to answer user questions using the provided FAQ data and recommend available products.
    
    FAQ Context:
    ${faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
    
    Available Products Context:
    ${products.map(p => `ID: ${p.id}, Name: ${p.title}, Price: ${p.price}, Stock: ${p.stock}`).join('\n')}
    
    Guidelines:
    - ONLY recommend products from the list above.
    - If a product is not in the list, it is unavailable.
    - Be polite and professional.
    - ALWAYS respond in the following JSON format:
    {
      "reply": "your text response",
      "recommendedProducts": [
        { "id": "uuid", "name": "string", "price": number, "url": "string" }
      ]
    }
  `;

  const history = session.messages.reverse().map(m => ({
    role: (m.role === ChatRole.USER ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    });

    const aiContent = completion.choices[0].message.content || '{}';
    let parsed: any;

    try {
      parsed = JSON.parse(aiContent);
      parsed = ChatResponseSchema.parse(parsed);
    } catch (e) {
      console.error('AI JSON parsing error:', e);
      parsed = {
        reply: "I'm sorry, I'm having trouble processing your request right now. How else can I help you?",
        recommendedProducts: [],
      };
    }

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: ChatRole.ASSISTANT,
        content: parsed.reply,
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastActive: new Date() },
    });

    return parsed;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new AppError('AI processing failed', 500);
  }
};
