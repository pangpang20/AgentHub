'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentsApi, Agent } from '@/lib/api/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AgentList() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAgents();
  }, [search]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsApi.list({ search: search || undefined });
      setAgents(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      await agentsApi.delete(id);
      loadAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete agent');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
        <Button onClick={() => router.push('/dashboard/agents/new')}>
          Create Agent
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No agents found</p>
          <Button onClick={() => router.push('/dashboard/agents/new')}>
            Create your first agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {agent.name}
              </h3>
              {agent.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {agent.llmProvider}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {agent.llmModel}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/agents/${agent.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(agent.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
