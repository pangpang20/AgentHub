# AgentHub 嵌入功能使用指南

## 功能概述

AgentHub 嵌入功能允许你将智能体部署到任何网站,通过简单的 JavaScript 代码即可在网站上添加 AI 聊天助手。

## 快速开始

### 1. 生成分享令牌

在 AgentHub 平台上,找到你想要嵌入的智能体,进入详情页面,点击"Generate Share Token"按钮获取分享令牌。

### 2. 添加嵌入代码

在你的网站 HTML 中添加以下代码:

```html
<!-- 引入 AgentHub Embed SDK -->
<script src="https://your-domain.com/embed.js"></script>

<!-- 初始化聊天组件 -->
<script>
  AgentHub.init({
    shareToken: 'your-share-token',
    position: 'bottom-right',
    theme: 'light',
    width: 400,
    height: 600,
    title: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    primaryColor: '#3b82f6',
  });
</script>
```

### 3. 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shareToken` | string | 必填 | 智能体的分享令牌 |
| `apiBaseUrl` | string | 'https://your-domain.com/api/v1/embed' | API 基础 URL |
| `position` | string | 'bottom-right' | 聊天窗口位置: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |
| `theme` | string | 'light' | 主题: 'light' 或 'dark' |
| `width` | number | 400 | 聊天窗口宽度(像素) |
| `height` | number | 600 | 聊天窗口高度(像素) |
| `title` | string | 'AI Assistant' | 聊天窗口标题 |
| `welcomeMessage` | string | 'Hello! How can I help you today?' | 欢迎消息 |
| `avatarUrl` | string | null | 头像图片 URL |
| `primaryColor` | string | '#3b82f6' | 主色调 |
| `autoOpen` | boolean | false | 是否自动打开聊天窗口 |
| `showHeader` | boolean | true | 是否显示头部 |
| `showFooter` | boolean | true | 是否显示底部 |
| `allowAttachments` | boolean | false | 是否允许附件 |
| `maxMessageHistory` | number | 50 | 最大消息历史数量 |

## 高级用法

### 编程控制

```javascript
// 获取嵌入实例
const embed = AgentHub.init({
  shareToken: 'your-share-token',
});

// 打开聊天窗口
embed.open();

// 关闭聊天窗口
embed.close();

// 切换聊天窗口
embed.toggle();

// 更新配置
embed.updateConfig({
  title: 'Updated Title',
  theme: 'dark',
});

// 销毁组件
embed.destroy();
```

### 自定义样式

虽然 SDK 提供了内置主题,但你也可以通过 CSS 进一步自定义样式:

```css
/* 自定义聊天容器 */
.agenthub-chat-container {
  z-index: 10000;
}

/* 自定义触发按钮 */
.agenthub-trigger-btn {
  border-radius: 8px;
}

/* 自定义消息气泡 */
.agenthub-message-user {
  border-radius: 8px 8px 0 8px;
}
```

## API 接口

### 获取智能体配置

```
GET /api/v1/embed/agent/:shareToken
```

返回智能体的公开配置信息。

### 创建对话

```
POST /api/v1/embed/conversations

Body:
{
  "shareToken": "your-share-token",
  "sessionId": "session-123",
  "visitorInfo": {
    "userAgent": "...",
    "language": "en-US",
    "screen": { "width": 1920, "height": 1080 },
    "referrer": "https://example.com",
    "url": "https://example.com/page"
  }
}
```

### 发送消息

```
POST /api/v1/embed/conversations/:conversationId/messages

Body:
{
  "content": "Hello, how can you help me?"
}
```

### 获取消息历史

```
GET /api/v1/embed/conversations/:conversationId/messages?page=1&limit=50
```

## 安全注意事项

1. **分享令牌保护**: 分享令牌应该保密,不要在公共代码仓库中暴露
2. **访问控制**: 只有设置为公开的智能体才能被嵌入
3. **速率限制**: 建议在后端实现速率限制,防止滥用
4. **HTTPS**: 生产环境中应该使用 HTTPS 协议
5. **CORS 配置**: 确保 API 服务器正确配置 CORS

## 管理分享令牌

### 生成分享令牌

```bash
POST /api/v1/agents/:id/share-token
Authorization: Bearer <your-token>
```

### 撤销分享令牌

```bash
DELETE /api/v1/agents/:id/share-token
Authorization: Bearer <your-token>
```

撤销后,使用该令牌的嵌入将无法访问智能体。

## 示例

### 基本示例

查看 `backend/public/embed-example.html` 获取完整的嵌入示例。

### React 集成

```jsx
import { useEffect, useRef } from 'react';

function ChatWidget({ shareToken }) {
  const embedRef = useRef(null);

  useEffect(() => {
    // 加载 SDK
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/embed.js';
    script.onload = () => {
      // 初始化
      embedRef.current = window.AgentHub.init({
        shareToken,
      });
    };
    document.body.appendChild(script);

    return () => {
      if (embedRef.current) {
        embedRef.current.destroy();
      }
    };
  }, [shareToken]);

  return null;
}
```

### Vue 集成

```vue
<template>
  <div></div>
</template>

<script>
export default {
  props: ['shareToken'],
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/embed.js';
    script.onload = () => {
      this.embed = window.AgentHub.init({
        shareToken: this.shareToken,
      });
    };
    document.body.appendChild(script);
  },
  beforeUnmount() {
    if (this.embed) {
      this.embed.destroy();
    }
  },
};
</script>
```

## 故障排除

### 聊天窗口不显示

1. 检查分享令牌是否正确
2. 确认智能体已设置为公开
3. 检查浏览器控制台是否有错误
4. 确认 API 服务器可访问

### 消息发送失败

1. 检查网络连接
2. 确认 API 地址配置正确
3. 查看服务器日志

### 样式问题

1. 检查是否有 CSS 冲突
2. 尝试使用不同的 z-index 值
3. 确认主题配置正确

## 支持

如有问题,请联系 support@agenthub.com 或查看我们的文档中心。
