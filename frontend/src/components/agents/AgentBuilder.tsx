'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentsApi, CreateAgentData } from '@/lib/api/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
];

const OPENAI_MODELS = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
const ANTHROPIC_MODELS = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
const GOOGLE_MODELS = ['gemini-pro', 'gemini-pro-vision'];

export default function AgentBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateAgentData>({
    name: '',
    description: '',
    systemPrompt: '',
    llmProvider: 'openai',
    llmModel: 'gpt-4',
    llmTemperature: 0.7,
    llmMaxTokens: 4096,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const agent = await agentsApi.create(formData);
      router.push(`/dashboard/agents/${agent.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create agent');
      setLoading(false);
    }
  };

  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'openai':
        return OPENAI_MODELS;
      case 'anthropic':
        return ANTHROPIC_MODELS;
      case 'google':
        return GOOGLE_MODELS;
      default:
        return [];
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
        <p className="mt-2 text-gray-600">
          Configure your AI agent with custom prompts and settings
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Agent Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Customer Support Bot"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of your agent"
          />
        </div>

        <div>
          <Label htmlFor="systemPrompt">System Prompt *</Label>
          <Textarea
            id="systemPrompt"
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            placeholder="You are a helpful AI assistant..."
            rows={6}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Define your agent's personality, behavior, and capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="llmProvider">LLM Provider *</Label>
            <Select
              value={formData.llmProvider}
              onValueChange={(value: 'openai' | 'anthropic' | 'google') => {
                setFormData({
                  ...formData,
                  llmProvider: value,
                  llmModel: getModelsForProvider(value)[0],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LLM_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="llmModel">Model *</Label>
            <Select
              value={formData.llmModel}
              onValueChange={(value) => setFormData({ ...formData, llmModel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProvider(formData.llmProvider).map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="llmTemperature">
              Temperature: {formData.llmTemperature}
            </Label>
            <input
              id="llmTemperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.llmTemperature}
              onChange={(e) => setFormData({ ...formData, llmTemperature: parseFloat(e.target.value) })}
              className="w-full mt-1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Higher = more creative, Lower = more focused
            </p>
          </div>

          <div>
            <Label htmlFor="llmMaxTokens">Max Tokens</Label>
            <Input
              id="llmMaxTokens"
              type="number"
              min="1"
              max="128000"
              value={formData.llmMaxTokens}
              onChange={(e) => setFormData({ ...formData, llmMaxTokens: parseInt(e.target.value) || 4096 })}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum response length
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/agents')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}
