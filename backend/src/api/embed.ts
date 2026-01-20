import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import crypto from 'crypto';

const router = Router();

// Get public agent configuration by share token
router.get('/agent/:shareToken', async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { shareToken },
      select: {
        id: true,
        name: true,
        description: true,
        systemPrompt: true,
        llmProvider: true,
        llmModel: true,
        llmTemperature: true,
        llmMaxTokens: true,
        isPublic: true,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.isPublic) {
      throw new AppError('Agent is not public', 403, 'AGENT_NOT_PUBLIC');
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Create a new conversation for embedded agent
router.post('/conversations', async (req, res, next) => {
  try {
    const { shareToken, sessionId } = req.body;

    if (!shareToken) {
      throw new AppError('Share token is required', 400, 'MISSING_SHARE_TOKEN');
    }

    // Get agent by share token
    const agent = await prisma.agent.findUnique({
      where: { shareToken },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.isPublic) {
      throw new AppError('Agent is not public', 403, 'AGENT_NOT_PUBLIC');
    }

    // Create conversation with embedded metadata
    const conversation = await prisma.conversation.create({
      data: {
        agentId: agent.id,
        userId: agent.userId, // Use agent owner as user for embedded conversations
        title: `Embedded Chat - ${sessionId || 'Unknown'}`,
      },
    });

    res.status(201).json({
      id: conversation.id,
      agentId: agent.id,
      agentName: agent.name,
    });
  } catch (error) {
    next(error);
  }
});

// Send a message in embedded conversation
router.post('/conversations/:conversationId/messages', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400, 'MISSING_CONTENT');
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true,
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (!conversation.agent.isPublic) {
      throw new AppError('Agent is not public', 403, 'AGENT_NOT_PUBLIC');
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

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 2 },
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    next(error);
  }
});

// Get messages in embedded conversation
router.get('/conversations/:conversationId/messages', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true,
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (!conversation.agent.isPublic) {
      throw new AppError('Agent is not public', 403, 'AGENT_NOT_PUBLIC');
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

// Generate share token for an agent (authenticated)
router.post('/agents/:id/share-token', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.headers;

    if (!apiKey) {
      throw new AppError('API key is required', 401, 'MISSING_API_KEY');
    }

    // Verify API key and get user
    const user = await prisma.user.findFirst({
      where: {
        // TODO: Implement proper API key verification
        // For now, we'll use a simple check
        email: apiKey as string,
      },
    });

    if (!user) {
      throw new AppError('Invalid API key', 401, 'INVALID_API_KEY');
    }

    // Get agent
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Generate share token if not exists
    if (!agent.shareToken) {
      const shareToken = crypto.randomBytes(32).toString('hex');
      await prisma.agent.update({
        where: { id },
        data: { shareToken },
      });
    }

    res.json({
      shareToken: agent.shareToken || crypto.randomBytes(32).toString('hex'),
      embedCode: generateEmbedCode(agent.shareToken || crypto.randomBytes(32).toString('hex')),
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate embed code
function generateEmbedCode(shareToken: string): string {
  return `<!-- AgentHub Embed Code -->
<script src="https://your-domain.com/embed.js"></script>
<script>
  AgentHub.init({
    shareToken: '${shareToken}',
    position: 'bottom-right',
    theme: 'light',
    width: 400,
    height: 600,
    title: 'AI Assistant',
  });
</script>`;
}

export default router;
