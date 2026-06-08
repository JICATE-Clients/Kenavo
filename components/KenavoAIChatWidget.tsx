'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import type { ChatMessage, GroundingChunk } from '@/lib/types/database';

export default function KenavoAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load example questions when opening for the first time
  useEffect(() => {
    if (isOpen && exampleQuestions.length === 0 && !loadingExamples) {
      fetchExampleQuestions();
    }
  }, [isOpen]);

  const fetchExampleQuestions = async () => {
    setLoadingExamples(true);
    try {
      const response = await fetch('/api/gemini/example-questions');
      const data = await response.json();
      if (response.ok && data.questions) {
        setExampleQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching example questions:', error);
    } finally {
      setLoadingExamples(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: textToSend }],
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        const aiMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: data.response }],
          groundingChunks: data.groundingChunks,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        let errorText = data.error || "I'm having trouble responding right now. Please try again.";

        if (response.status === 429) {
          errorText = "I'm a little busy right now — too many people asking at once! Give me a minute and try again.";
        } else if (response.status === 500) {
          errorText = "Something went wrong on my end. Please try again in a moment.";
        }

        const errorMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: errorText }],
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: "I'm having trouble connecting right now. Please check your connection and try again." }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    sendMessage(question);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    const text = message.parts[0]?.text || '';

    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 lg:mb-4`}>
        <div className={`max-w-[85%] lg:max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          <div
            className={`rounded-2xl px-3 py-2 lg:px-4 lg:py-3 ${
              isUser
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-sm lg:text-base">{text}</div>

            {/* Grounding Chunks (Sources) */}
            {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-white/20">
                <p className="text-[10px] lg:text-xs text-white/60 mb-1 lg:mb-2">Sources:</p>
                {message.groundingChunks.map((chunk, idx) => (
                  <div key={idx} className="text-[10px] lg:text-xs text-white/80 mb-1 flex items-start gap-1">
                    <ExternalLink size={10} className="lg:w-3 lg:h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {chunk.retrievedContext?.text?.substring(0, 80)}...
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {!isUser && (
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-purple-600 flex items-center justify-center ml-1.5 lg:ml-2 flex-shrink-0">
            <Sparkles size={14} className="lg:w-4 lg:h-4 text-white" />
          </div>
        )}
        {isUser && (
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/20 flex items-center justify-center mr-1.5 lg:mr-2 flex-shrink-0">
            <span className="text-white font-semibold text-xs lg:text-sm">You</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 lg:bottom-6 left-4 lg:left-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 lg:p-4 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-50 flex items-center gap-2 group"
          aria-label="Open Kenavo AI Assistant"
        >
          <Sparkles size={20} className="lg:w-6 lg:h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold text-sm lg:text-base">
            Ask Kenavo AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-6 left-2 lg:left-6 w-[calc(100vw-1rem)] max-w-[340px] lg:max-w-[400px] h-[420px] lg:h-[600px] bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl border border-white/20 flex flex-col z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-3 lg:p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Sparkles size={14} className="lg:w-4 lg:h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm lg:text-base">Kenavo AI Assistant</h3>
                <p className="text-[10px] lg:text-xs text-white/60">Ask me anything about Kenavo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-all p-1 hover:bg-white/10 rounded-lg"
              aria-label="Close chat"
            >
              <X size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-4 lg:py-8">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Sparkles size={24} className="lg:w-8 lg:h-8 text-purple-400" />
                </div>
                <h4 className="text-white font-bold text-base lg:text-lg mb-1 lg:mb-2">Welcome to Kenavo AI!</h4>
                <p className="text-white/60 text-xs lg:text-sm mb-4 lg:mb-6 px-2">
                  I can help you find information about alumni, events, and more.
                </p>

                {/* Example Questions */}
                {loadingExamples ? (
                  <div className="flex items-center justify-center gap-2 text-white/50">
                    <Loader2 size={14} className="lg:w-4 lg:h-4 animate-spin" />
                    <span className="text-xs lg:text-sm">Loading suggestions...</span>
                  </div>
                ) : exampleQuestions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-white/60 text-[10px] lg:text-xs mb-2 lg:mb-3">Try asking:</p>
                    {exampleQuestions.slice(0, 4).map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(question)}
                        className="w-full text-left px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs lg:text-sm transition-all border border-white/10 hover:border-white/30"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              messages.map((msg, idx) => renderMessage(msg, idx))
            )}

            {loading && (
              <div className="flex justify-start mb-3 lg:mb-4">
                <div className="max-w-[85%] lg:max-w-[80%] flex items-center gap-1.5 lg:gap-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-white/10 border border-white/20">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 lg:p-4 border-t border-white/20">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                disabled={loading}
                className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white/10 text-white text-sm lg:text-base placeholder-white/50 border border-white/20 focus:border-white/50 focus:outline-none resize-none disabled:opacity-50"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white transition-all flex items-center justify-center disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 size={18} className="lg:w-5 lg:h-5 animate-spin" />
                ) : (
                  <Send size={18} className="lg:w-5 lg:h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] lg:text-xs text-white/40 mt-1.5 lg:mt-2 text-center">
              Powered by Google Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
