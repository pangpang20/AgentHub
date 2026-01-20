'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { agentsApi, Agent } from '@/lib/api/agents';
import { Button } from '@/components/ui/button';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadAgent();
  }, [isAuthenticated, router, params.id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const data = await agentsApi.get(params.id);
      setAgent(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      await agentsApi.delete(params.id);
      router.push('/dashboard/agents');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete agent');
    }
  };

  const handleStartConversation = () => {
    router.push(`/dashboard/conversations/new?agentId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Agent not found'}</p>
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
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Agents
                </a>
                <a
                  href="/dashboard/conversations"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {agent.name}
                </h1>
                {agent.description && (
                  <p className="text-gray-600">{agent.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/agents/${agent.id}/edit`)}
                >
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">LLM Provider:</span>
                    <span className="ml-2 text-gray-900">{agent.llmProvider}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Model:</span>
                    <span className="ml-2 text-gray-900">{agent.llmModel}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Temperature:</span>
                    <span className="ml-2 text-gray-900">{agent.llmTemperature}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Max Tokens:</span>
                    <span className="ml-2 text-gray-900">{agent.llmMaxTokens}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Visibility:</span>
                    <span className="ml-2 text-gray-900">
                      {agent.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(agent.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">System Prompt</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{agent.systemPrompt}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleStartConversation} className="flex-1">
                Start Conversation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
