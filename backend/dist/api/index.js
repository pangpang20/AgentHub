"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const agents_1 = __importDefault(require("./agents"));
const conversations_1 = __importDefault(require("./conversations"));
const knowledge_base_1 = __importDefault(require("./knowledge-base"));
const plugins_1 = __importDefault(require("./plugins"));
const templates_1 = __importDefault(require("./templates"));
const embed_1 = __importDefault(require("./embed"));
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
            embed: '/v1/embed',
        },
    });
});
// Register route modules
router.use('/auth', auth_1.default);
router.use('/agents', agents_1.default);
router.use('/conversations', conversations_1.default);
router.use('/knowledge-base', knowledge_base_1.default);
router.use('/plugins', plugins_1.default);
router.use('/templates', templates_1.default);
router.use('/embed', embed_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map