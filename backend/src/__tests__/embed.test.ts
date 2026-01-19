import request from 'supertest';
import express from 'express';
import embedRoutes from '../api/embed';
import prisma from '../config/database';

// Mock Prisma
jest.mock('../config/database');

describe('Embed API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/embed', embedRoutes);
  });

  describe('GET /embed/agent/:shareToken', () => {
    it('should return public agent configuration', async () => {
      const mockAgent = {
        id: 'agent-1',
        name: 'Test Agent',
        description: 'Test Description',
        systemPrompt: 'You are a helpful assistant',
        llmProvider: 'openai',
        llmModel: 'gpt-4',
        llmTemperature: 0.7,
        llmMaxTokens: 4096,
        isPublic: true,
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      const response = await request(app)
        .get('/embed/agent/test-share-token')
        .expect(200);

      expect(response.body).toEqual(mockAgent);
    });

    it('should return 404 for non-existent agent', async () => {
      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/embed/agent/non-existent-token')
        .expect(404);
    });

    it('should return 403 for private agent', async () => {
      const mockAgent = {
        id: 'agent-1',
        name: 'Test Agent',
        isPublic: false,
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      await request(app)
        .get('/embed/agent/private-token')
        .expect(403);
    });
  });

  describe('POST /embed/conversations', () => {
    it('should create a new conversation', async () => {
      const mockAgent = {
        id: 'agent-1',
        userId: 'user-1',
        isPublic: true,
      };

      const mockConversation = {
        id: 'conv-1',
        agentId: 'agent-1',
        userId: 'user-1',
        title: 'Embedded Chat - session-123',
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const response = await request(app)
        .post('/embed/conversations')
        .send({
          shareToken: 'test-share-token',
          sessionId: 'session-123',
          visitorInfo: {
            userAgent: 'test-agent',
            language: 'en-US',
          },
        })
        .expect(201);

      expect(response.body).toEqual({
        id: 'conv-1',
        agentId: 'agent-1',
        agentName: undefined,
      });
    });

    it('should return 400 if shareToken is missing', async () => {
      await request(app)
        .post('/embed/conversations')
        .send({})
        .expect(400);
    });
  });

  describe('POST /embed/conversations/:conversationId/messages', () => {
    it('should send a message and receive response', async () => {
      const mockConversation = {
        id: 'conv-1',
        agent: {
          id: 'agent-1',
          isPublic: true,
        },
      };

      const mockUserMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
      };

      const mockAssistantMessage = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hi there!',
      };

      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.create as jest.Mock)
        .mockResolvedValueOnce(mockUserMessage)
        .mockResolvedValueOnce(mockAssistantMessage);
      (prisma.conversation.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/embed/conversations/conv-1/messages')
        .send({ content: 'Hello' })
        .expect(201);

      expect(response.body).toEqual({
        userMessage: mockUserMessage,
        assistantMessage: mockAssistantMessage,
      });
    });

    it('should return 400 if content is missing', async () => {
      await request(app)
        .post('/embed/conversations/conv-1/messages')
        .send({})
        .expect(400);
    });
  });

  describe('GET /embed/conversations/:conversationId/messages', () => {
    it('should return conversation messages', async () => {
      const mockConversation = {
        id: 'conv-1',
        agent: {
          id: 'agent-1',
          isPublic: true,
        },
      };

      const mockMessages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Hi there!',
        },
      ];

      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.message.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/embed/conversations/conv-1/messages')
        .expect(200);

      expect(response.body).toEqual({
        data: mockMessages,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
        },
      });
    });
  });
});
