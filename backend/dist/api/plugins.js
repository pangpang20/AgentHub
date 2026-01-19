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
// Get all available plugins (marketplace)
router.get('/marketplace', async (req, res, next) => {
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
        const [plugins, total] = await Promise.all([
            database_1.default.plugin.findMany({
                where,
                skip,
                take: limit,
                orderBy: { downloadCount: 'desc' },
            }),
            database_1.default.plugin.count({ where }),
        ]);
        res.json({
            data: plugins,
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
// Get installed plugins for user's agents
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const agentId = req.query.agentId;
        if (!agentId) {
            throw new error_1.AppError('Agent ID is required', 400, 'MISSING_AGENT_ID');
        }
        // Verify agent belongs to user
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: agentId,
                userId: req.user.id,
            },
        });
        if (!agent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        const installedPlugins = await database_1.default.agentPlugin.findMany({
            where: {
                agentId,
            },
            include: {
                plugin: true,
            },
        });
        res.json({
            data: installedPlugins.map((ap) => ({
                ...ap.plugin,
                config: ap.config,
                enabled: ap.isEnabled,
            })),
        });
    }
    catch (error) {
        next(error);
    }
});
// Install a plugin to an agent
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { agentId, pluginId, config: pluginConfig } = req.body;
        if (!agentId || !pluginId) {
            throw new error_1.AppError('Agent ID and Plugin ID are required', 400, 'MISSING_FIELDS');
        }
        // Verify agent belongs to user
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: agentId,
                userId: req.user.id,
            },
        });
        if (!agent) {
            throw new error_1.AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
        // Verify plugin exists
        const plugin = await database_1.default.plugin.findUnique({
            where: { id: pluginId },
        });
        if (!plugin) {
            throw new error_1.AppError('Plugin not found', 404, 'PLUGIN_NOT_FOUND');
        }
        // Check if plugin is already installed
        const existing = await database_1.default.agentPlugin.findUnique({
            where: {
                agentId_pluginId: {
                    agentId,
                    pluginId,
                },
            },
        });
        if (existing) {
            throw new error_1.AppError('Plugin already installed', 409, 'PLUGIN_ALREADY_INSTALLED');
        }
        // Install plugin
        const agentPlugin = await database_1.default.agentPlugin.create({
            data: {
                agentId,
                pluginId,
                config: pluginConfig || {},
                isEnabled: true,
            },
        });
        // Update plugin download count
        await database_1.default.plugin.update({
            where: { id: pluginId },
            data: {
                downloadCount: {
                    increment: 1,
                },
            },
        });
        res.status(201).json({
            ...plugin,
            config: agentPlugin.config,
            enabled: agentPlugin.isEnabled,
        });
    }
    catch (error) {
        next(error);
    }
});
// Update plugin configuration
router.put('/:agentPluginId', auth_1.authenticate, async (req, res, next) => {
    try {
        const agentPluginId = Array.isArray(req.params.agentPluginId)
            ? req.params.agentPluginId[0]
            : req.params.agentPluginId;
        const { config: pluginConfig, enabled } = req.body;
        // Verify agent plugin belongs to user's agent
        const agentPlugin = await database_1.default.agentPlugin.findFirst({
            where: {
                agentId: agentPluginId,
                agent: {
                    userId: req.user.id,
                },
            },
            include: {
                plugin: true,
            },
        });
        if (!agentPlugin) {
            throw new error_1.AppError('Agent plugin not found', 404, 'AGENT_PLUGIN_NOT_FOUND');
        }
        // Update agent plugin
        const updated = await database_1.default.agentPlugin.update({
            where: {
                agentId_pluginId: {
                    agentId: agentPluginId,
                    pluginId: agentPlugin.pluginId,
                },
            },
            data: {
                ...(pluginConfig !== undefined && { config: pluginConfig }),
                ...(enabled !== undefined && { isEnabled: enabled }),
            },
        });
        res.json({
            ...agentPlugin.plugin,
            config: updated.config,
            enabled: updated.isEnabled,
        });
    }
    catch (error) {
        next(error);
    }
});
// Uninstall a plugin from an agent
router.delete('/:agentPluginId', auth_1.authenticate, async (req, res, next) => {
    try {
        const agentPluginId = Array.isArray(req.params.agentPluginId)
            ? req.params.agentPluginId[0]
            : req.params.agentPluginId;
        // Verify agent plugin belongs to user's agent
        const agentPlugin = await database_1.default.agentPlugin.findFirst({
            where: {
                agentId: agentPluginId,
                agent: {
                    userId: req.user.id,
                },
            },
        });
        if (!agentPlugin) {
            throw new error_1.AppError('Agent plugin not found', 404, 'AGENT_PLUGIN_NOT_FOUND');
        }
        // Uninstall plugin
        await database_1.default.agentPlugin.delete({
            where: {
                agentId_pluginId: {
                    agentId: agentPluginId,
                    pluginId: agentPlugin.pluginId,
                },
            },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Execute a plugin (sandboxed execution)
router.post('/:agentPluginId/execute', auth_1.authenticate, async (req, res, next) => {
    try {
        const agentPluginId = Array.isArray(req.params.agentPluginId)
            ? req.params.agentPluginId[0]
            : req.params.agentPluginId;
        const { input } = req.body;
        if (!input) {
            throw new error_1.AppError('Input is required', 400, 'MISSING_INPUT');
        }
        // Verify agent plugin belongs to user's agent and is enabled
        const agentPlugin = await database_1.default.agentPlugin.findFirst({
            where: {
                agentId: agentPluginId,
                agent: {
                    userId: req.user.id,
                },
                isEnabled: true,
            },
            include: {
                plugin: true,
            },
        });
        if (!agentPlugin) {
            throw new error_1.AppError('Agent plugin not found or disabled', 404, 'AGENT_PLUGIN_NOT_FOUND');
        }
        // TODO: Implement sandboxed plugin execution
        // This would involve:
        // 1. Create a sandboxed environment (vm2, isolated-vm, etc.)
        // 2. Load the plugin code
        // 3. Execute the plugin with the input
        // 4. Capture and return the output
        // 5. Handle errors and timeouts
        // For now, return a placeholder response
        res.json({
            output: `Plugin execution not yet implemented. Plugin: ${agentPlugin.plugin.name}, Input: ${JSON.stringify(input)}`,
            metadata: {},
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=plugins.js.map