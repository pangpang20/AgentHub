import apiClient from './index';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  metadata?: {
    plugin?: string;
    latency?: number;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name: string;
    llmProvider: string;
  };
  messages?: Message[];
}

export interface CreateConversationData {
  agentId: string;
  title?: string;
}

export interface SendMessageData {
  content: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const conversationsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    agentId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Conversation>> => {
    const response = await apiClient.get('/conversations', { params });
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
      params,
    });
    return response.data;
  },

  create: async (data: CreateConversationData): Promise<Conversation> => {
    const response = await apiClient.post('/conversations', data);
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    data: SendMessageData
  ): Promise<SendMessageResponse> => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },
};
