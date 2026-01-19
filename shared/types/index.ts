// Shared TypeScript types for AgentHub platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: Date;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Document {
  id: string;
  knowledgeBaseId: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'txt' | 'docx' | 'md';
  chunkCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  iconUrl?: string;
  capabilities: string[];
  permissions: string[];
  isOfficial: boolean;
  isVerified: boolean;
  downloadCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl?: string;
  systemPrompt: string;
  llmProvider: string;
  llmModel: string;
  defaultPlugins?: string[];
  useCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
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

export interface ApiError {
  error: string;
  message: string;
  code: string;
  details?: Record<string, any>;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export interface MessageStreamData {
  conversationId: string;
  messageId: string;
  chunk: string;
  isComplete: boolean;
  metadata?: {
    plugin?: string;
    latency?: number;
  };
}

export interface MessageCompleteData {
  conversationId: string;
  messageId: string;
  content: string;
  tokens: number;
  metadata?: {
    plugin?: string;
    latency?: number;
    model?: string;
    temperature?: number;
  };
}
