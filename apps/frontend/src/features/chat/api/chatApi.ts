import type { Message } from '../types';

export const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const chatStream = async (query: string, history: Message[], token: string | null) => {
  const response = await fetch(`${getBaseUrl()}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      query,
      history: history.map(m => ({
        role: m.role,
        content: m.content
      }))
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from chat API');
  }

  return response.body;
};
