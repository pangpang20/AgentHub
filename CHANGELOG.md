# 更新日志

## [未发布]

### 新增功能

#### 智能体嵌入功能
- ✨ 新增智能体嵌入功能,允许将智能体部署到任何网站
- 🚀 创建了 JavaScript Embed SDK (`backend/public/embed.js`)
- 📝 提供了完整的嵌入示例页面 (`backend/public/embed-example.html`)
- 🔐 实现了分享令牌机制,用于安全地公开智能体
- 🎨 支持多种主题(亮色/暗色)和位置配置
- 💬 提供了可定制的聊天窗口 UI

### 后端 API

#### 新增路由
- `GET /api/v1/embed/agent/:shareToken` - 获取公开智能体配置
- `POST /api/v1/embed/conversations` - 创建嵌入对话
- `POST /api/v1/embed/conversations/:conversationId/messages` - 发送消息
- `GET /api/v1/embed/conversations/:conversationId/messages` - 获取消息历史
- `POST /api/v1/agents/:id/share-token` - 生成分享令牌
- `DELETE /api/v1/agents/:id/share-token` - 撤销分享令牌

### 前端组件

#### 新增组件
- `EmbedCode` - 用于显示和复制嵌入代码的组件
- 支持可视化配置嵌入选项(位置、主题、颜色等)
- 实时预览嵌入代码

### 文档

- 📚 新增嵌入功能使用指南 (`EMBED_GUIDE.md`)
- 📝 提供了详细的 API 文档和示例代码
- 🔍 包含故障排除指南

### 数据库

- 在 `Agent` 模型中添加了 `shareToken` 字段(唯一)
- 为 `Conversation` 模型添加了 `metadata` 字段支持(待迁移)

### 修复

- 🔧 修复了 ESLint 版本兼容性问题(降级到 8.x)
- 🔧 修复了 GitHub Actions workflow 中的 npm 缓存配置

### 测试

- ✅ 添加了嵌入 API 的单元测试 (`backend/src/__tests__/embed.test.ts`)

## 配置说明

### 环境变量

确保在 `.env` 文件中配置以下变量:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://...
```

### 部署步骤

1. 运行数据库迁移:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. 构建项目:
   ```bash
   npm run build
   ```

3. 启动服务:
   ```bash
   npm start
   ```

4. 部署 `embed.js` 到静态文件服务器
5. 更新嵌入代码中的 API 基础 URL

## 使用示例

### 基本嵌入

```html
<script src="https://your-domain.com/embed.js"></script>
<script>
  AgentHub.init({
    shareToken: 'your-share-token',
  });
</script>
```

### 高级配置

```html
<script src="https://your-domain.com/embed.js"></script>
<script>
  AgentHub.init({
    shareToken: 'your-share-token',
    position: 'bottom-right',
    theme: 'dark',
    width: 450,
    height: 650,
    title: 'Customer Support',
    welcomeMessage: 'Hi! How can I help you?',
    primaryColor: '#667eea',
  });
</script>
```

## 待办事项

- [ ] 实现 LLM 集成(目前使用占位符响应)
- [ ] 添加消息历史持久化
- [ ] 实现文件附件功能
- [ ] 添加实时通知支持
- [ ] 实现多语言支持
- [ ] 添加使用分析统计
- [ ] 实现速率限制
- [ ] 添加 CORS 配置选项
- [ ] 优化移动端体验
- [ ] 添加离线消息队列

## 贡献者

感谢所有为这个项目做出贡献的开发者!

## 许可证

MIT License
