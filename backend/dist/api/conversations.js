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
// Get all conversations for authenticated user
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const agentId = req.query.agentId;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const where = {
            userId: req.user.id,
        };
        if (agentId) {
            where.agentId = agentId;
        }
        if (status) {
            where.status = status;
        }
        const [conversations, total] = await Promise.all([
            database_1.default.conversation.findMany({
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
            database_1.default.conversation.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
// Get a specific conversation
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const conversation = await database_1.default.conversation.findFirst({
            where: {
                id,
                userId: req.user.id,
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
            throw new error_1.AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        res.json(conversation);
    }
    catch (error) {
        next(error);
    }
});
// Get messages in a conversation
router.get('/:conversationId/messages', auth_1.authenticate, async (req, res, next) => {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        // Verify conversation belongs to user
        const conversation = await database_1.default.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id,
            },
        });
        if (!conversation) {
            throw new error_1.AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        const [messages, total] = await Promise.all([
            database_1.default.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            database_1.default.message.count({ where: { conversationId } }),
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
    }
    catch (error) {
        next(error);
    }
});
// Create a new conversation
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { agentId, title } = req.body;
        if (!agentId) {
            throw new error_1.AppError('Agent ID is required', 400, 'MISSING_AGENT_ID');
        }
        // Verify agent exists and belongs to user
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: agentId,
                userId: req.user.id,
            },
        });
        if (!agent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        const conversation = await database_1.default.conversation.create({
            data: {
                agentId,
                userId: req.user.id,
                title,
            },
        });
        res.status(201).json(conversation);
    }
    catch (error) {
        next(error);
    }
});
// Send a message in a conversation
router.post('/:conversationId/messages', auth_1.authenticate, async (req, res, next) => {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const { content } = req.body;
        if (!content) {
            throw new error_1.AppError('Message content is required', 400, 'MISSING_CONTENT');
        }
        // Verify conversation belongs to user
        const conversation = await database_1.default.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id,
            },
            include: {
                agent: true,
            },
        });
        if (!conversation) {
            throw new error_1.AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        // Create user message
        const userMessage = await database_1.default.message.create({
            data: {
                conversationId,
                role: 'user',
                content,
            },
        });
        // TODO: Implement LLM integration to generate assistant response
        // For now, create a placeholder assistant message
        const assistantMessage = await database_1.default.message.create({
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
        await database_1.default.conversation.update({
            where: { id: conversationId },
            data: { messageCount: conversation.messageCount + 2 },
        });
        res.status(201).json({
            userMessage,
            assistantMessage,
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete a conversation
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Check if conversation exists and belongs to user
        const existingConversation = await database_1.default.conversation.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!existingConversation) {
            throw new error_1.AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        // Delete conversation (cascade will delete messages)
        await database_1.default.conversation.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=conversations.js.map