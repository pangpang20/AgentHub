"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const error_1 = require("../middleware/error");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all users (admin only)
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        // TODO: Add admin check here
        // For now, only allow users to see themselves
        const where = {
            id: req.user.id,
        };
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
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
            database_1.default.user.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
// Get a specific user
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Users can only view their own profile (unless admin)
        if (id !== req.user.id) {
            throw new error_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        const user = await database_1.default.user.findUnique({
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
            throw new error_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name, avatarUrl } = req.body;
        // Users can only update their own profile (unless admin)
        if (id !== req.user.id) {
            throw new error_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        const user = await database_1.default.user.update({
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
    }
    catch (error) {
        next(error);
    }
});
// Delete user account
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Users can only delete their own account (unless admin)
        if (id !== req.user.id) {
            throw new error_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        // Delete user (cascade will delete related records)
        await database_1.default.user.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Get user's agents
router.get('/:id/agents', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Users can only view their own agents (unless admin)
        if (id !== req.user.id) {
            throw new error_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        const agents = await database_1.default.agent.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ data: agents });
    }
    catch (error) {
        next(error);
    }
});
// Get user's conversations
router.get('/:id/conversations', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Users can only view their own conversations (unless admin)
        if (id !== req.user.id) {
            throw new error_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        const conversations = await database_1.default.conversation.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map