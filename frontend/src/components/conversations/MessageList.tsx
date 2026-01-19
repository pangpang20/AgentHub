'use client';

import { Message } from '@/lib/api/conversations';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
              {message.tokens && (
                <p className="text-xs opacity-70">{message.tokens} tokens</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
