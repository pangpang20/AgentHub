import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all conversations for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const agentId = req.query.agentId as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: req.user!.id,
    };

    if (agentId) {
      where.agentId = agentId;
    }

    if (status) {
      where.status = status;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              llmProvider: true,
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific conversation
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            llmProvider: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Get messages in a conversation
router.get('/:conversationId/messages', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const conversationId = Array.isArray(req.params.conversationId) 
      ? req.params.conversationId[0] 
      : req.params.conversationId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user!.id,
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    res.json({
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new conversation
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { agentId, title } = req.body;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'MISSING_AGENT_ID');
    }

    // Verify agent exists and belongs to user
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const conversation = await prisma.conversation.create({
      data: {
        agentId,
        userId: req.user!.id,
        title,
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
});

// Send a message in a conversation
router.post('/:conversationId/messages', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const conversationId = Array.isArray(req.params.conversationId) 
      ? req.params.conversationId[0] 
      : req.params.conversationId;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400, 'MISSING_CONTENT');
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user!.id,
      },
      include: {
        agent: true,
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    });

    // TODO: Implement LLM integration to generate assistant response
    // For now, create a placeholder assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: `This is a placeholder response. The AI integration is not yet implemented. You said: "${content}"`,
        metadata: {
          plugin: null,
          latency: 0,
        },
      },
    });

    // Update conversation message count
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { messageCount: conversation.messageCount + 2 },
    });

    res.status(201).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a conversation
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if conversation exists and belongs to user
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingConversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    // Delete conversation (cascade will delete messages)
    await prisma.conversation.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
