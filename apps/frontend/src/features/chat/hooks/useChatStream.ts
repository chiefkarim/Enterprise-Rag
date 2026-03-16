import { useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { chatStream } from '../api/chatApi';
import type { Message } from '../types';

export const useChatStream = () => {
  const { messages, addMessage, updateLastAssistantMessage } = useChatStore();
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      const stream = await chatStream(input, messages, accessToken);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      const reader = stream?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') break;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.token) {
                  updateLastAssistantMessage(data.token);
                }
              } catch (e) {
                console.error('Error parsing JSON from stream', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};
