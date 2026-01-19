import { Router } from 'express';
import authRoutes from './auth';
import agentsRoutes from './agents';
import conversationsRoutes from './conversations';
import knowledgeBaseRoutes from './knowledge-base';
import pluginsRoutes from './plugins';
import templatesRoutes from './templates';
import embedRoutes from './embed';

const router = Router();

// Placeholder for API routes
router.get('/', (_req, res) => {
  res.json({
    message: 'AgentHub API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/v1/auth',
      agents: '/v1/agents',
      conversations: '/v1/conversations',
      knowledgeBase: '/v1/knowledge-base',
      plugins: '/v1/plugins',
      templates: '/v1/templates',
      embed: '/v1/embed',
    },
  });
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/agents', agentsRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/knowledge-base', knowledgeBaseRoutes);
router.use('/plugins', pluginsRoutes);
router.use('/templates', templatesRoutes);
router.use('/embed', embedRoutes);

export default router;
