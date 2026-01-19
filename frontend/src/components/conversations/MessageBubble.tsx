'use client';

import { Message } from '@/lib/api/conversations';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
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
  );
}
