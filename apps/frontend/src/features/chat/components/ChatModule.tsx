import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, User, Bot, Loader2 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { Markdown } from './Markdown';
import { useChatStream } from '../hooks/useChatStream';

export const ChatModule: React.FC = () => {
  const { messages, clearChat } = useChatStore();
  const { sendMessage, isLoading } = useChatStream();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');
    await sendMessage(currentInput);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#5DD7AD]/20 rounded-lg">
            <Bot className="w-5 h-5 text-[#5DD7AD]" />
          </div>
          <h2 className="font-bold text-white">Enterprise AI Assistant</h2>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-white/40 hover:text-red-400 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <Bot className="w-16 h-16 text-[#5DD7AD]" />
            <div>
              <p className="text-xl font-medium text-white">Welcome!</p>
              <p className="text-sm text-white/60">How can I help you today?</p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-4 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              m.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#5DD7AD]/20 text-[#5DD7AD]'
            }`}>
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`flex flex-col space-y-1 max-w-[80%] ${
              m.role === 'user' ? 'items-end' : ''
            }`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600/20 text-white rounded-tr-none' 
                  : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
              }`}>
                {m.role === 'user' ? (
                  m.content
                ) : (
                  m.content ? <Markdown content={m.content} /> : (isLoading && <Loader2 className="w-4 h-4 animate-spin" />)
                )}
              </div>
              <span className="text-[10px] text-white/20 uppercase tracking-wider">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message..."
            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#5DD7AD]/50 focus:border-[#5DD7AD]/50 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#5DD7AD] text-[#0a1628] rounded-lg font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-[#5DD7AD]/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
