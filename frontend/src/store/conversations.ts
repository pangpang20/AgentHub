import { create } from 'zustand';

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface ConversationsState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  addConversation: (conversation) =>
    set((state) => ({ conversations: [...state.conversations, conversation] })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
      selectedConversation:
        state.selectedConversation?.id === id
          ? { ...state.selectedConversation, ...updates }
          : state.selectedConversation,
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      selectedConversation:
        state.selectedConversation?.id === id ? null : state.selectedConversation,
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), message],
            messageCount: conv.messageCount + 1,
          };
        }
        return conv;
      }),
      selectedConversation:
        state.selectedConversation?.id === conversationId
          ? {
              ...state.selectedConversation,
              messages: [...(state.selectedConversation.messages || []), message],
              messageCount: state.selectedConversation.messageCount + 1,
            }
          : state.selectedConversation,
    })),
  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages?.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          };
        }
        return conv;
      }),
      selectedConversation:
        state.selectedConversation?.id === conversationId
          ? {
              ...state.selectedConversation,
              messages: state.selectedConversation.messages?.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            }
          : state.selectedConversation,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
