import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, AlertCircle } from 'lucide-react';
import { generateText } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SAMPLE_PROMPTS } from '../constants';

const ChatTool: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const text = await generateText(userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 rounded-lg overflow-hidden shadow-xl border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          Chat Assistant
        </h2>
        {messages.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <Bot className="w-16 h-16 mb-4 text-gray-600" />
            <p className="text-lg font-medium">How can I help you today?</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isError 
                    ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-bl-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span>{msg.role === 'user' ? 'You' : 'Gemini'}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-800">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full bg-gray-900 text-white rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-4 pr-12 py-3 resize-none h-[52px] overflow-hidden"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Gemini may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
};

export default ChatTool;
