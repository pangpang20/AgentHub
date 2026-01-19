import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all templates (gallery)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { useCount: 'desc' },
      }),
      prisma.template.count({ where }),
    ]);

    res.json({
      data: templates,
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

// Get a specific template
router.get('/:id', async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Create an agent from a template
router.post('/:id/create', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const templateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description } = req.body;

    if (!name) {
      throw new AppError('Agent name is required', 400, 'MISSING_NAME');
    }

    // Get template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    // Create agent from template
    const agent = await prisma.agent.create({
      data: {
        userId: req.user!.id,
        name,
        description: description || template.description,
        systemPrompt: template.systemPrompt,
        llmProvider: template.llmProvider,
        llmModel: template.llmModel,
        llmTemperature: 0.7,
        llmMaxTokens: 4096,
      },
    });

    // Create knowledge base for the agent
    await prisma.knowledgeBase.create({
      data: {
        agentId: agent.id,
      },
    });

    // Update template usage count
    await prisma.template.update({
      where: { id: templateId },
      data: {
        useCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json(agent);
  } catch (error) {
    next(error);
  }
});

// Create a new template (admin only)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      name,
      description,
      systemPrompt,
      llmProvider,
      llmModel,
      category,
      iconUrl,
    } = req.body;

    if (!name || !systemPrompt || !llmProvider || !llmModel) {
      throw new AppError('Name, system prompt, LLM provider, and model are required', 400, 'MISSING_FIELDS');
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user to create templates

    const template = await prisma.template.create({
      data: {
        name,
        description,
        systemPrompt,
        llmProvider,
        llmModel,
        category: category || 'general',
        iconUrl,
        isFeatured: false,
        useCount: 0,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Update a template (admin only)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      name,
      description,
      systemPrompt,
      llmProvider,
      llmModel,
      category,
      iconUrl,
    } = req.body;

    // TODO: Add admin check here

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(llmProvider !== undefined && { llmProvider }),
        ...(llmModel !== undefined && { llmModel }),
        ...(category !== undefined && { category }),
        ...(iconUrl !== undefined && { iconUrl }),
      },
    });

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Delete a template (admin only)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // TODO: Add admin check here

    // Delete template
    await prisma.template.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
