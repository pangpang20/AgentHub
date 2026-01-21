'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { agentsApi, Agent } from '@/lib/api/agents';
import { conversationsApi, CreateConversationData } from '@/lib/api/conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const agentId = searchParams.get('agentId');
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (agentId) {
      loadAgent(agentId);
    } else {
      // If no agentId, redirect to agents page
      router.push('/dashboard/agents');
    }
  }, [isAuthenticated, router, agentId]);

  const loadAgent = async (id: string) => {
    try {
      setLoading(true);
      const data = await agentsApi.get(id);
      setAgent(data);
      // Set default title based on agent name
      setTitle(`Conversation with ${data.name}`);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent) {
      setError('No agent selected');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setError('');
    setSending(true);

    try {
      // Create conversation
      const conversation = await conversationsApi.create({
        agentId: agent.id,
        title: title || `Conversation with ${agent.name}`,
      } as CreateConversationData);

      // Send first message
      await conversationsApi.sendMessage(conversation.id, {
        content: message,
      });

      // Redirect to conversation detail page
      router.push(`/dashboard/conversations/${conversation.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start conversation');
      setSending(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/agents');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/agents')}>
            Back to Agents
          </Button>
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/agents')}
              className="mb-4"
            >
              ← Back to Agents
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Start Conversation</h1>
              <p className="mt-2 text-gray-600">
                Start a new conversation with {agent?.name}
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {agent && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Agent: {agent.name}
                </h3>
                {agent.description && (
                  <p className="text-gray-600 text-sm">{agent.description}</p>
                )}
              </div>
            )}

            <form onSubmit={handleStartConversation} className="space-y-6">
              <div>
                <Label htmlFor="title">Conversation Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this conversation"
                />
              </div>

              <div>
                <Label htmlFor="message">Your Message *</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? 'Starting...' : 'Start Conversation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
