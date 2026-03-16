import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../types';

type ChatState = {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (token: string) => void;
  clearChat: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateLastAssistantMessage: (token) =>
        set((state) => {
          const lastMessage = state.messages[state.messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessages = [...state.messages];
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + token,
            };
            return { messages: updatedMessages };
          }
          return state;
        }),
      clearChat: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
