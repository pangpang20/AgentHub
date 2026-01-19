/**
 * AgentHub Embed SDK
 * 用于将智能体嵌入到任何网站
 *
 * 使用方法:
 * 1. 在网站中引入此脚本
 * 2. 调用 AgentHub.init() 进行初始化
 *
 * 示例:
 * <script src="https://your-domain.com/embed.js"></script>
 * <script>
 *   AgentHub.init({
 *     shareToken: 'your-share-token',
 *     position: 'bottom-right',
 *     theme: 'light',
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  // 配置默认值
  const DEFAULT_CONFIG = {
    apiBaseUrl: 'https://your-domain.com/api/v1/embed',
    position: 'bottom-right',
    theme: 'light',
    width: 400,
    height: 600,
    title: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    avatarUrl: null,
    primaryColor: '#3b82f6',
    autoOpen: false,
    showHeader: true,
    showFooter: true,
    allowAttachments: false,
    maxMessageHistory: 50,
  };

  // 主题样式
  const THEMES = {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      inputBackgroundColor: '#f9fafb',
      inputPlaceholderColor: '#9ca3af',
      messageUserBg: '#3b82f6',
      messageUserText: '#ffffff',
      messageAssistantBg: '#f3f4f6',
      messageAssistantText: '#1f2937',
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    dark: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      borderColor: '#374151',
      inputBackgroundColor: '#374151',
      inputPlaceholderColor: '#9ca3af',
      messageUserBg: '#3b82f6',
      messageUserText: '#ffffff',
      messageAssistantBg: '#374151',
      messageAssistantText: '#f9fafb',
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    },
  };

  class AgentHubEmbed {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.conversationId = null;
      this.sessionId = this.generateSessionId();
      this.agentConfig = null;
      this.messages = [];
      this.isOpen = false;
      this.container = null;
      this.chatContainer = null;
      this.messagesContainer = null;
      this.inputContainer = null;
      this.messageInput = null;
      this.isTyping = false;
    }

    // 初始化
    async init() {
      try {
        // 加载智能体配置
        await this.loadAgentConfig();

        // 创建聊天窗口
        this.createChatWindow();

        // 创建触发按钮
        this.createTriggerButton();

        // 如果设置了自动打开,则打开聊天窗口
        if (this.config.autoOpen) {
          this.open();
        }
      } catch (error) {
        console.error('Failed to initialize AgentHub:', error);
      }
    }

    // 生成会话ID
    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 加载智能体配置
    async loadAgentConfig() {
      try {
        const response = await fetch(`${this.config.apiBaseUrl}/agent/${this.config.shareToken}`);
        if (!response.ok) {
          throw new Error('Failed to load agent configuration');
        }
        this.agentConfig = await response.json();
      } catch (error) {
        console.error('Failed to load agent configuration:', error);
        throw error;
      }
    }

    // 创建聊天窗口
    createChatWindow() {
      // 创建容器
      this.container = document.createElement('div');
      this.container.className = 'agenthub-chat-container';
      this.container.style.cssText = this.getContainerStyles();

      // 创建聊天内容
      const theme = THEMES[this.config.theme];

      this.container.innerHTML = `
        <div class="agenthub-chat-window" style="
          width: ${this.config.width}px;
          height: ${this.config.height}px;
          background: ${theme.backgroundColor};
          border: 1px solid ${theme.borderColor};
          border-radius: 12px;
          box-shadow: ${theme.shadow};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: fixed;
          z-index: 9999;
          ${this.getPositionStyles()}
          display: none;
        ">
          ${this.config.showHeader ? this.getHeaderHTML(theme) : ''}
          
          <div class="agenthub-messages" style="
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          "></div>
          
          <div class="agenthub-input-container" style="
            padding: 16px;
            border-top: 1px solid ${theme.borderColor};
            background: ${theme.backgroundColor};
          ">
            <div style="display: flex; gap: 8px;">
              ${this.config.allowAttachments ? `
                <button class="agenthub-attach-btn" style="
                  padding: 8px 12px;
                  border: 1px solid ${theme.borderColor};
                  border-radius: 6px;
                  background: ${theme.inputBackgroundColor};
                  cursor: pointer;
                  color: ${theme.textColor};
                " title="Attach file">📎</button>
              ` : ''}
              <input type="text" 
                class="agenthub-message-input" 
                placeholder="Type your message..." 
                style="
                  flex: 1;
                  padding: 10px 14px;
                  border: 1px solid ${theme.borderColor};
                  border-radius: 6px;
                  background: ${theme.inputBackgroundColor};
                  color: ${theme.textColor};
                  font-size: 14px;
                  outline: none;
                " />
              <button class="agenthub-send-btn" style="
                padding: 10px 16px;
                background: ${this.config.primaryColor};
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
              ">Send</button>
            </div>
          </div>
          
          ${this.config.showFooter ? this.getFooterHTML(theme) : ''}
        </div>
      `;

      document.body.appendChild(this.container);

      // 获取元素引用
      this.chatContainer = this.container.querySelector('.agenthub-chat-window');
      this.messagesContainer = this.container.querySelector('.agenthub-messages');
      this.messageInput = this.container.querySelector('.agenthub-message-input');
      const sendBtn = this.container.querySelector('.agenthub-send-btn');

      // 绑定事件
      this.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      sendBtn.addEventListener('click', () => this.sendMessage());

      // 显示欢迎消息
      if (this.config.welcomeMessage) {
        this.addMessage('assistant', this.config.welcomeMessage);
      }
    }

    // 获取容器样式
    getContainerStyles() {
      return `
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `;
    }

    // 获取位置样式
    getPositionStyles() {
      const positions = {
        'bottom-right': 'bottom: 80px; right: 20px;',
        'bottom-left': 'bottom: 80px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    // 获取头部HTML
    getHeaderHTML(theme) {
      return `
        <div class="agenthub-header" style="
          padding: 16px;
          border-bottom: 1px solid ${theme.borderColor};
          background: ${theme.backgroundColor};
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${this.config.avatarUrl ? `
              <img src="${this.config.avatarUrl}" 
                   alt="Avatar" 
                   style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
            ` : `
              <div style="
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                background: ${this.config.primaryColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
              ">${this.config.title.charAt(0)}</div>
            `}
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: ${theme.textColor};">
                ${this.config.title}
              </h3>
              <p style="margin: 0; font-size: 12px; color: ${theme.inputPlaceholderColor};">
                ${this.agentConfig ? this.agentConfig.name : 'AI Assistant'}
              </p>
            </div>
          </div>
          <button class="agenthub-close-btn" style="
            background: none;
            border: none;
            cursor: pointer;
            font-size: 24px;
            color: ${theme.textColor};
            padding: 4px;
            line-height: 1;
          ">×</button>
        </div>
      `;
    }

    // 获取底部HTML
    getFooterHTML(theme) {
      return `
        <div class="agenthub-footer" style="
          padding: 8px 16px;
          border-top: 1px solid ${theme.borderColor};
          background: ${theme.inputBackgroundColor};
          text-align: center;
        ">
          <p style="margin: 0; font-size: 11px; color: ${theme.inputPlaceholderColor};">
            Powered by AgentHub
          </p>
        </div>
      `;
    }

    // 创建触发按钮
    createTriggerButton() {
      const button = document.createElement('button');
      button.className = 'agenthub-trigger-btn';
      button.style.cssText = `
        position: fixed;
        z-index: 9999;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        ${this.getPositionStyles().replace('bottom: 80px;', 'bottom: 20px;')}
      `;

      button.innerHTML = '💬';
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
      });
      button.addEventListener('click', () => this.toggle());

      document.body.appendChild(button);
      this.triggerButton = button;
    }

    // 切换聊天窗口
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    // 打开聊天窗口
    open() {
      this.isOpen = true;
      this.chatContainer.style.display = 'flex';
      this.triggerButton.style.display = 'none';
      this.messageInput.focus();
    }

    // 关闭聊天窗口
    close() {
      this.isOpen = false;
      this.chatContainer.style.display = 'none';
      this.triggerButton.style.display = 'flex';
    }

    // 添加消息
    addMessage(role, content) {
      const theme = THEMES[this.config.theme];
      const messageDiv = document.createElement('div');
      messageDiv.className = `agenthub-message agenthub-message-${role}`;
      messageDiv.style.cssText = `
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        ${role === 'user' 
          ? `background: ${theme.messageUserBg}; color: ${theme.messageUserText}; margin-left: auto;` 
          : `background: ${theme.messageAssistantBg}; color: ${theme.messageAssistantText};`
        }
        word-wrap: break-word;
        line-height: 1.4;
      `;

      // 处理换行
      const formattedContent = content.replace(/\n/g, '<br>');
      messageDiv.innerHTML = formattedContent;

      this.messagesContainer.appendChild(messageDiv);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

      // 限制消息历史
      const messages = this.messagesContainer.querySelectorAll('.agenthub-message');
      if (messages.length > this.config.maxMessageHistory) {
        messages[0].remove();
      }
    }

    // 发送消息
    async sendMessage() {
      const content = this.messageInput.value.trim();
      if (!content || this.isTyping) {
        return;
      }

      // 添加用户消息
      this.addMessage('user', content);
      this.messageInput.value = '';
      this.isTyping = true;

      try {
        // 如果还没有对话ID,创建对话
        if (!this.conversationId) {
          await this.createConversation();
        }

        // 发送消息到服务器
        const response = await fetch(`${this.config.apiBaseUrl}/conversations/${this.conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // 添加助手消息
        this.addMessage('assistant', data.assistantMessage.content);
      } catch (error) {
        console.error('Failed to send message:', error);
        this.addMessage('assistant', 'Sorry, there was an error processing your message. Please try again.');
      } finally {
        this.isTyping = false;
      }
    }

    // 创建对话
    async createConversation() {
      try {
        const visitorInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          referrer: document.referrer,
          url: window.location.href,
        };

        const response = await fetch(`${this.config.apiBaseUrl}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: this.config.shareToken,
            sessionId: this.sessionId,
            visitorInfo,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const data = await response.json();
        this.conversationId = data.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        throw error;
      }
    }

    // 更新配置
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      // 重新创建聊天窗口
      if (this.container) {
        this.container.remove();
        this.createChatWindow();
      }
    }

    // 销毁
    destroy() {
      if (this.container) {
        this.container.remove();
      }
      if (this.triggerButton) {
        this.triggerButton.remove();
      }
    }
  }

  // 导出到全局
  window.AgentHub = {
    init: function(config) {
      if (!config.shareToken) {
        console.error('AgentHub: shareToken is required');
        return null;
      }

      const embed = new AgentHubEmbed(config);
      embed.init();
      return embed;
    },
  };

})(window);
