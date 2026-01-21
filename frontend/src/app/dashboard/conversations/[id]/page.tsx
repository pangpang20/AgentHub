'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { conversationsApi, Conversation, Message } from '@/lib/api/conversations';
import { agentsApi, Agent } from '@/lib/api/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadConversation();
  }, [isAuthenticated, router, params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      // Load conversation and messages in parallel
      const [convData, messagesData] = await Promise.all([
        conversationsApi.get(params.id),
        conversationsApi.getMessages(params.id),
      ]);

      setConversation(convData);
      setMessages(messagesData);
      
      // Load agent details
      if (convData.agentId) {
        const agentData = await agentsApi.get(convData.agentId);
        setAgent(agentData);
      }
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || sending) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');
    setSending(true);

    try {
      // Add user message to the list immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: params.id,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send message to API
      const response = await conversationsApi.sendMessage(params.id, {
        content: userMessage,
      });

      // Add assistant response to the list
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
      }

      // Update conversation title if needed
      if (response.conversation) {
        setConversation(response.conversation);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/conversations');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleBack}>
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {conversation?.title || 'Conversation'}
                </h1>
                {agent && (
                  <p className="text-sm text-gray-600">
                    with {agent.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Input form */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !inputMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
