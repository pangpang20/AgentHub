"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
        },
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map