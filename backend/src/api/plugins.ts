import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all available plugins (marketplace)
router.get('/marketplace', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
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
      prisma.plugin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { downloadCount: 'desc' },
      }),
      prisma.plugin.count({ where }),
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
  } catch (error) {
    next(error);
  }
});

// Get installed plugins for user's agents
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const agentId = req.query.agentId as string;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'MISSING_AGENT_ID');
    }

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const installedPlugins = await prisma.agentPlugin.findMany({
      where: {
        agentId,
      },
      include: {
        plugin: true,
      },
    });

    res.json({
      data: installedPlugins.map((ap: { plugin: unknown; config: unknown; isEnabled: boolean }) => ({
        ...(ap.plugin as Record<string, unknown>),
        config: ap.config,
        enabled: ap.isEnabled,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Install a plugin to an agent
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { agentId, pluginId, config: pluginConfig } = req.body;

    if (!agentId || !pluginId) {
      throw new AppError('Agent ID and Plugin ID are required', 400, 'MISSING_FIELDS');
    }

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Verify plugin exists
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
    });

    if (!plugin) {
      throw new AppError('Plugin not found', 404, 'PLUGIN_NOT_FOUND');
    }

    // Check if plugin is already installed
    const existing = await prisma.agentPlugin.findUnique({
      where: {
        agentId_pluginId: {
          agentId,
          pluginId,
        },
      },
    });

    if (existing) {
      throw new AppError('Plugin already installed', 409, 'PLUGIN_ALREADY_INSTALLED');
    }

    // Install plugin
    const agentPlugin = await prisma.agentPlugin.create({
      data: {
        agentId,
        pluginId,
        config: pluginConfig || {},
        isEnabled: true,
      },
    });

    // Update plugin download count
    await prisma.plugin.update({
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
  } catch (error) {
    next(error);
  }
});

// Update plugin configuration
router.put('/:agentPluginId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const agentPluginId = Array.isArray(req.params.agentPluginId) 
      ? req.params.agentPluginId[0] 
      : req.params.agentPluginId;
    const { config: pluginConfig, enabled } = req.body;

    // Verify agent plugin belongs to user's agent
    const agentPlugin = await prisma.agentPlugin.findFirst({
      where: {
        agentId: agentPluginId,
        agent: {
          userId: req.user!.id,
        },
      },
      include: {
        plugin: true,
      },
    });

    if (!agentPlugin) {
      throw new AppError('Agent plugin not found', 404, 'AGENT_PLUGIN_NOT_FOUND');
    }

    // Update agent plugin
    const updated = await prisma.agentPlugin.update({
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
  } catch (error) {
    next(error);
  }
});

// Uninstall a plugin from an agent
router.delete('/:agentPluginId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const agentPluginId = Array.isArray(req.params.agentPluginId) 
      ? req.params.agentPluginId[0] 
      : req.params.agentPluginId;

    // Verify agent plugin belongs to user's agent
    const agentPlugin = await prisma.agentPlugin.findFirst({
      where: {
        agentId: agentPluginId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!agentPlugin) {
      throw new AppError('Agent plugin not found', 404, 'AGENT_PLUGIN_NOT_FOUND');
    }

    // Uninstall plugin
    await prisma.agentPlugin.delete({
      where: {
        agentId_pluginId: {
          agentId: agentPluginId,
          pluginId: agentPlugin.pluginId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Execute a plugin (sandboxed execution)
router.post('/:agentPluginId/execute', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const agentPluginId = Array.isArray(req.params.agentPluginId) 
      ? req.params.agentPluginId[0] 
      : req.params.agentPluginId;
    const { input } = req.body;

    if (!input) {
      throw new AppError('Input is required', 400, 'MISSING_INPUT');
    }

    // Verify agent plugin belongs to user's agent and is enabled
    const agentPlugin = await prisma.agentPlugin.findFirst({
      where: {
        agentId: agentPluginId,
        agent: {
          userId: req.user!.id,
        },
        isEnabled: true,
      },
      include: {
        plugin: true,
      },
    });

    if (!agentPlugin) {
      throw new AppError('Agent plugin not found or disabled', 404, 'AGENT_PLUGIN_NOT_FOUND');
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
  } catch (error) {
    next(error);
  }
});

export default router;
