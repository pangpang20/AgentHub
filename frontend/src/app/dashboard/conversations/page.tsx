'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { conversationsApi, Conversation } from '@/lib/api/conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatInterface from '@/components/conversations/ChatInterface';

function ConversationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useUserStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadConversations();

    // Check if coming from an agent to create new conversation
    const agentId = searchParams.get('agentId');
    if (agentId) {
      createConversation(agentId);
    }
  }, [isAuthenticated, router, searchParams]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list();
      setConversations(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (agentId: string, title?: string) => {
    try {
      const conversation = await conversationsApi.create({ agentId, title });
      setSelectedConversation(conversation);
      setView('chat');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create conversation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await conversationsApi.delete(id);
      loadConversations();
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        setView('list');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete conversation');
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setView('list');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-2xl font-bold text-gray-900 hover:text-gray-700"
                >
                  AgentHub
                </button>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/dashboard/agents"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Agents
                </a>
                <a
                  href="/dashboard/conversations"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Conversations
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={() => router.push('/dashboard/agents')}>
                New Agent
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {view === 'list' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Conversations</h1>
                <Button onClick={() => router.push('/dashboard/agents')}>
                  Start New Conversation
                </Button>
              </div>

              <div className="mb-6">
                <Input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No conversations found</p>
                  <Button onClick={() => router.push('/dashboard/agents')}>
                    Create an agent to start chatting
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setView('chat');
                      }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {conversation.title || 'Untitled Conversation'}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {conversation.agent?.name || 'Unknown Agent'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {conversation.messageCount} messages
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        <p>Last updated: {new Date(conversation.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConversation(conversation);
                            setView('chat');
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conversation.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <Button variant="outline" onClick={handleBack} className="mb-4">
                  ← Back to Conversations
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedConversation?.title || 'Untitled Conversation'}
                </h2>
                {selectedConversation?.agent && (
                  <p className="text-gray-600">
                    with {selectedConversation.agent.name}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
                {selectedConversation && (
                  <ChatInterface conversationId={selectedConversation.id} />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConversationsContent />
    </Suspense>
  );
}
