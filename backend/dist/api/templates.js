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
// Get all templates (gallery)
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = {
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
            database_1.default.template.findMany({
                where,
                skip,
                take: limit,
                orderBy: { useCount: 'desc' },
            }),
            database_1.default.template.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
// Get a specific template
router.get('/:id', async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const template = await database_1.default.template.findUnique({
            where: { id },
        });
        if (!template) {
            throw new error_1.AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
});
// Create an agent from a template
router.post('/:id/create', auth_1.authenticate, async (req, res, next) => {
    try {
        const templateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name, description } = req.body;
        if (!name) {
            throw new error_1.AppError('Agent name is required', 400, 'MISSING_NAME');
        }
        // Get template
        const template = await database_1.default.template.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new error_1.AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
        }
        // Create agent from template
        const agent = await database_1.default.agent.create({
            data: {
                userId: req.user.id,
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
        await database_1.default.knowledgeBase.create({
            data: {
                agentId: agent.id,
            },
        });
        // Update template usage count
        await database_1.default.template.update({
            where: { id: templateId },
            data: {
                useCount: {
                    increment: 1,
                },
            },
        });
        res.status(201).json(agent);
    }
    catch (error) {
        next(error);
    }
});
// Create a new template (admin only)
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { name, description, systemPrompt, llmProvider, llmModel, category, iconUrl, } = req.body;
        if (!name || !systemPrompt || !llmProvider || !llmModel) {
            throw new error_1.AppError('Name, system prompt, LLM provider, and model are required', 400, 'MISSING_FIELDS');
        }
        // TODO: Add admin check here
        // For now, allow any authenticated user to create templates
        const template = await database_1.default.template.create({
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
    }
    catch (error) {
        next(error);
    }
});
// Update a template (admin only)
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name, description, systemPrompt, llmProvider, llmModel, category, iconUrl, } = req.body;
        // TODO: Add admin check here
        const template = await database_1.default.template.update({
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
    }
    catch (error) {
        next(error);
    }
});
// Delete a template (admin only)
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // TODO: Add admin check here
        // Delete template
        await database_1.default.template.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=templates.js.map