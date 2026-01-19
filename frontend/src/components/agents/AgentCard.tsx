'use client';

import { Agent } from '@/lib/api/agents';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function AgentCard({ agent, onEdit, onDelete, showActions = true }: AgentCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/agents/${agent.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(agent);
    } else {
      router.push(`/dashboard/agents/${agent.id}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
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
        {agent.isPublic && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Public
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-4">
        <p>Temperature: {agent.llmTemperature}</p>
        <p>Max Tokens: {agent.llmMaxTokens}</p>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleView} className="flex-1">
            View
          </Button>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
