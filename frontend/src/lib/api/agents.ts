import apiClient from './index';

export interface Agent {
  id: string;
  userId: string;
  name: string;
  description?: string;
  systemPrompt: string;
  llmProvider: 'openai' | 'anthropic' | 'google';
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  isPublic: boolean;
  shareToken?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentData {
  name: string;
  description?: string;
  systemPrompt: string;
  llmProvider: 'openai' | 'anthropic' | 'google';
  llmModel: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  templateId?: string;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  systemPrompt?: string;
  llmProvider?: 'openai' | 'anthropic' | 'google';
  llmModel?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  isPublic?: boolean;
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

export const agentsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Agent>> => {
    const response = await apiClient.get('/agents', { params });
    return response.data;
  },

  get: async (id: string): Promise<Agent> => {
    const response = await apiClient.get(`/agents/${id}`);
    return response.data;
  },

  create: async (data: CreateAgentData): Promise<Agent> => {
    const response = await apiClient.post('/agents', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    const response = await apiClient.put(`/agents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/agents/${id}`);
  },
};
