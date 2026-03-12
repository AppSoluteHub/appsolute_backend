"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUserMessage = exports.getSessionMessages = exports.startChatSession = void 0;
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const env_1 = __importDefault(require("../../../config/env"));
const appError_1 = require("../../../lib/appError");
const chat_dto_1 = require("../dto/chat.dto");
const prisma = new client_1.PrismaClient();
const openai = new openai_1.default({
    apiKey: env_1.default.openai_api_key,
});
const startChatSession = async (data) => {
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
    }
    else if (!user.fullName && data.fullName) {
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
exports.startChatSession = startChatSession;
const getSessionMessages = async (sessionId) => {
    return await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
    });
};
exports.getSessionMessages = getSessionMessages;
const processUserMessage = async (sessionId, userMessage) => {
    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 15 } },
    });
    if (!session) {
        throw new appError_1.BadRequestError('Chat session not found', 404);
    }
    await prisma.chatMessage.create({
        data: {
            sessionId,
            role: client_1.ChatRole.USER,
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
        role: (m.role === client_1.ChatRole.USER ? 'user' : 'assistant'),
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
        let parsed;
        try {
            parsed = JSON.parse(aiContent);
            parsed = chat_dto_1.ChatResponseSchema.parse(parsed);
        }
        catch (e) {
            console.error('AI JSON parsing error:', e);
            parsed = {
                reply: "I'm sorry, I'm having trouble processing your request right now. How else can I help you?",
                recommendedProducts: [],
            };
        }
        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: client_1.ChatRole.ASSISTANT,
                content: parsed.reply,
            },
        });
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { lastActive: new Date() },
        });
        return parsed;
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        throw new appError_1.AppError('AI processing failed', 500);
    }
};
exports.processUserMessage = processUserMessage;
