import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all agents for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: req.user!.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agent.count({ where }),
    ]);

    res.json({
      data: agents,
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

// Get a specific agent
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: {
        id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Create a new agent
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      name,
      description,
      systemPrompt,
      llmProvider,
      llmModel,
      llmTemperature,
      llmMaxTokens,
      templateId,
    } = req.body;

    if (!name || !systemPrompt || !llmProvider || !llmModel) {
      throw new AppError('Name, system prompt, LLM provider, and model are required', 400, 'MISSING_FIELDS');
    }

    const agent = await prisma.agent.create({
      data: {
        userId: req.user!.id,
        name: name as string,
        description: description as string | undefined,
        systemPrompt: systemPrompt as string,
        llmProvider: llmProvider as string,
        llmModel: llmModel as string,
        llmTemperature: llmTemperature || 0.7,
        llmMaxTokens: llmMaxTokens || 4096,
        templateId: templateId as string | undefined,
      },
    });

    // Create knowledge base for the agent
    await prisma.knowledgeBase.create({
      data: {
        agentId: agent.id,
      },
    });

    res.status(201).json(agent);
  } catch (error) {
    next(error);
  }
});

// Update an agent
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      name,
      description,
      systemPrompt,
      llmProvider,
      llmModel,
      llmTemperature,
      llmMaxTokens,
      isPublic,
    } = req.body;

    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        userId: req.user!.id,
      },
    });

    if (!existingAgent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const agent = await prisma.agent.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        ...(name !== undefined && { name: name as string }),
        ...(description !== undefined && { description: description as string }),
        ...(systemPrompt !== undefined && { systemPrompt: systemPrompt as string }),
        ...(llmProvider !== undefined && { llmProvider: llmProvider as string }),
        ...(llmModel !== undefined && { llmModel: llmModel as string }),
        ...(llmTemperature !== undefined && { llmTemperature }),
        ...(llmMaxTokens !== undefined && { llmMaxTokens }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Delete an agent
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        userId: req.user!.id,
      },
    });

    if (!existingAgent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Delete agent (cascade will delete related records)
    await prisma.agent.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
