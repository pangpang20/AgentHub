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
// Get all agents for authenticated user
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = {
            userId: req.user.id,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [agents, total] = await Promise.all([
            database_1.default.agent.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.agent.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
// Get a specific agent
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
                userId: req.user.id,
            },
        });
        if (!agent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
// Create a new agent
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { name, description, systemPrompt, llmProvider, llmModel, llmTemperature, llmMaxTokens, templateId, } = req.body;
        if (!name || !systemPrompt || !llmProvider || !llmModel) {
            throw new error_1.AppError('Name, system prompt, LLM provider, and model are required', 400, 'MISSING_FIELDS');
        }
        const agent = await database_1.default.agent.create({
            data: {
                userId: req.user.id,
                name: name,
                description: description,
                systemPrompt: systemPrompt,
                llmProvider: llmProvider,
                llmModel: llmModel,
                llmTemperature: llmTemperature || 0.7,
                llmMaxTokens: llmMaxTokens || 4096,
                templateId: templateId,
            },
        });
        // Create knowledge base for the agent
        await database_1.default.knowledgeBase.create({
            data: {
                agentId: agent.id,
            },
        });
        res.status(201).json(agent);
    }
    catch (error) {
        next(error);
    }
});
// Update an agent
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const { name, description, systemPrompt, llmProvider, llmModel, llmTemperature, llmMaxTokens, isPublic, } = req.body;
        // Check if agent exists and belongs to user
        const existingAgent = await database_1.default.agent.findFirst({
            where: {
                id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
                userId: req.user.id,
            },
        });
        if (!existingAgent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        const agent = await database_1.default.agent.update({
            where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
            data: {
                ...(name !== undefined && { name: name }),
                ...(description !== undefined && { description: description }),
                ...(systemPrompt !== undefined && { systemPrompt: systemPrompt }),
                ...(llmProvider !== undefined && { llmProvider: llmProvider }),
                ...(llmModel !== undefined && { llmModel: llmModel }),
                ...(llmTemperature !== undefined && { llmTemperature }),
                ...(llmMaxTokens !== undefined && { llmMaxTokens }),
                ...(isPublic !== undefined && { isPublic }),
            },
        });
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
// Delete an agent
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        // Check if agent exists and belongs to user
        const existingAgent = await database_1.default.agent.findFirst({
            where: {
                id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
                userId: req.user.id,
            },
        });
        if (!existingAgent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        // Delete agent (cascade will delete related records)
        await database_1.default.agent.delete({
            where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=agents.js.map