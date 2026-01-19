'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { agentsApi } from '@/lib/api/agents';

interface EmbedCodeProps {
  agentId: string;
  agentName: string;
}

export default function EmbedCode({ agentId, agentName }: EmbedCodeProps) {
  const [shareToken, setShareToken] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    position: 'bottom-right',
    theme: 'light',
    width: 400,
    height: 600,
    title: agentName,
    welcomeMessage: 'Hello! How can I help you today?',
    primaryColor: '#3b82f6',
  });

  useEffect(() => {
    loadShareToken();
  }, [agentId]);

  const loadShareToken = async () => {
    try {
      setLoading(true);
      const data = await agentsApi.generateShareToken(agentId);
      setShareToken(data.shareToken);
      setEmbedCode(data.embedCode);
      setConfig(prev => ({ ...prev, title: data.agentName }));
    } catch (error) {
      console.error('Failed to load share token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateEmbedCode = () => {
    return `<!-- AgentHub Embed Code -->
<script src="https://your-domain.com/embed.js"></script>
<script>
  AgentHub.init({
    shareToken: '${shareToken}',
    position: '${config.position}',
    theme: '${config.theme}',
    width: ${config.width},
    height: ${config.height},
    title: '${config.title}',
    welcomeMessage: '${config.welcomeMessage}',
    primaryColor: '${config.primaryColor}',
  });
</script>`;
  };

  const handleConfigChange = (key: string, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading && !shareToken) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Embed Agent</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? 'Hide' : 'Configure'}
        </Button>
      </div>

      {showConfig && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={config.position}
                onChange={(e) => handleConfigChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) => handleConfigChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={config.width}
                onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={config.height}
                onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Share Token
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareToken}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(shareToken);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Embed Code
        </label>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            <code>{generateEmbedCode()}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="absolute top-2 right-2"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to use:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Copy the embed code above</li>
          <li>Paste it into your website's HTML</li>
          <li>Replace <code className="bg-blue-100 px-1 rounded">https://your-domain.com</code> with your actual domain</li>
          <li>The chat widget will appear on your website</li>
        </ol>
      </div>
    </div>
  );
}
