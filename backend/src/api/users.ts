import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // TODO: Add admin check here
    // For now, only allow users to see themselves
    const where: any = {
      id: req.user!.id,
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isEmailVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
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

// Get a specific user
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Users can only view their own profile (unless admin)
    if (id !== req.user!.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            agents: true,
            conversations: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, avatarUrl } = req.body;

    // Users can only update their own profile (unless admin)
    if (id !== req.user!.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Users can only delete their own account (unless admin)
    if (id !== req.user!.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get user's agents
router.get('/:id/agents', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Users can only view their own agents (unless admin)
    if (id !== req.user!.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const agents = await prisma.agent.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: agents });
  } catch (error) {
    next(error);
  }
});

// Get user's conversations
router.get('/:id/conversations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Users can only view their own conversations (unless admin)
    if (id !== req.user!.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: conversations });
  } catch (error) {
    next(error);
  }
});

export default router;
