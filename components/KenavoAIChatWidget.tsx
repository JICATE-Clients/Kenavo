'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/database';

/** Brand anchors — flat purple canvas with a rose accent, matching the site. */
const PURPLE = '#4E2E8C';
const ACCENT = 'rgba(217,81,100,1)';

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

  // Close on Escape while the chat is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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
                ? 'bg-white text-[#4E2E8C] rounded-br-md shadow-sm'
                : 'bg-white/10 text-white border border-white/15 rounded-bl-md'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-sm lg:text-base leading-relaxed">{text}</div>

            {/* Grounding Chunks (Sources) */}
            {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-white/15">
                <p className="text-[10px] lg:text-xs text-white/55 mb-1 lg:mb-2 font-medium uppercase tracking-wide">Sources</p>
                {message.groundingChunks.map((chunk, idx) => (
                  <div key={idx} className="text-[10px] lg:text-xs text-white/75 mb-1 flex items-start gap-1">
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
          <div
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ml-1.5 lg:ml-2 flex-shrink-0"
            style={{ backgroundColor: ACCENT }}
          >
            <Sparkles size={14} className="lg:w-4 lg:h-4 text-white" />
          </div>
        )}
        {isUser && (
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/15 flex items-center justify-center mr-1.5 lg:mr-2 flex-shrink-0">
            <span className="text-white font-semibold text-xs lg:text-sm">You</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button — 3D colored chat-bubble icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="kenavo-shine fixed bottom-28 right-4 lg:bottom-24 lg:right-6 z-50 transition-transform duration-300 hover:scale-[1.08] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/50 rounded-full"
          aria-label="Open Kenavo AI Assistant"
        >
          <svg
            viewBox="5 6 54 54"
            className="h-10 w-10"
            role="img"
            aria-hidden
          >
            <defs>
              {/* Body: lighter purple top → brand purple bottom for a rounded,
                  lit look. The white outline below keeps it readable even when
                  the launcher sits over a purple part of the page. */}
              <linearGradient id="kenavoBubbleBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D78E6" />
                <stop offset="55%" stopColor="#6E45C2" />
                <stop offset="100%" stopColor="#4E2E8C" />
              </linearGradient>
              {/* Glossy highlight across the top */}
              <linearGradient id="kenavoBubbleGloss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              {/* Soft drop shadow for depth */}
              <filter id="kenavoBubbleShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#2A1A52" floodOpacity="0.5" />
              </filter>
            </defs>

            <g filter="url(#kenavoBubbleShadow)">
              {/* Speech bubble body + tail — white outline so the purple bubble
                  separates cleanly from a purple background. */}
              <path
                d="M16 8 H48 a10 10 0 0 1 10 10 V36 a10 10 0 0 1 -10 10 H30 l-10 10 v-10 h-4 a10 10 0 0 1 -10 -10 V18 a10 10 0 0 1 10 -10 Z"
                fill="url(#kenavoBubbleBody)"
                stroke="#ffffff"
                strokeOpacity="0.9"
                strokeWidth="2"
              />
              {/* Top gloss */}
              <path
                d="M16 8 H48 a10 10 0 0 1 10 10 V28 H6 V18 a10 10 0 0 1 10 -10 Z"
                fill="url(#kenavoBubbleGloss)"
              />
              {/* Specular shine — a soft highlight that gently pulses */}
              <ellipse cx="24" cy="19" rx="9" ry="4.2" fill="#ffffff" opacity="0.55" transform="rotate(-18 24 19)">
                <animate attributeName="opacity" values="0.3;0.75;0.3" dur="2.6s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="20" cy="17" r="1.8" fill="#ffffff" opacity="0.9" />
            </g>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Kenavo AI Assistant"
          style={{ backgroundColor: PURPLE }}
          className="fixed bottom-24 lg:bottom-6 right-2 lg:right-6 w-[calc(100vw-1rem)] max-w-[340px] lg:max-w-[400px] h-[420px] lg:h-[600px] rounded-2xl shadow-2xl border border-white/15 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 lg:p-4 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                <Sparkles size={15} className="lg:w-[18px] lg:h-[18px] text-white" />
              </div>
              <div className="leading-tight">
                <h3 className="text-white font-bold text-sm lg:text-base">Kenavo AI Assistant</h3>
                <p className="flex items-center gap-1.5 text-[10px] lg:text-xs text-white/65">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  Online · Ask me anything
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Close chat"
            >
              <X size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 ? (
              <div className="text-center py-4 lg:py-8">
                <div
                  className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4"
                  style={{ backgroundColor: 'rgba(217,81,100,0.18)' }}
                >
                  <Sparkles size={24} className="lg:w-8 lg:h-8" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-white font-bold text-base lg:text-lg mb-1 lg:mb-2">Welcome to Kenavo AI</h4>
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
                    <p className="text-white/55 text-[10px] lg:text-xs mb-2 lg:mb-3 uppercase tracking-wide font-medium">Try asking</p>
                    {exampleQuestions.slice(0, 4).map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(question)}
                        className="w-full text-left px-3 py-2 lg:px-4 lg:py-3 rounded-xl bg-white/[0.07] hover:bg-white/15 text-white/90 hover:text-white text-xs lg:text-sm transition-colors border border-white/10 hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                  <div
                    className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <Sparkles size={14} className="lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-3 py-2 lg:px-4 lg:py-3 bg-white/10 border border-white/15">
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
          <div className="p-3 lg:p-4 border-t border-white/15">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                disabled={loading}
                aria-label="Message"
                className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-xl bg-white/10 text-white text-sm lg:text-base placeholder-white/45 border border-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none disabled:opacity-50 transition-colors"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ backgroundColor: input.trim() && !loading ? ACCENT : 'rgba(217,81,100,0.45)' }}
                className="h-[38px] w-[38px] lg:h-[46px] lg:w-[46px] flex-shrink-0 rounded-xl text-white transition-colors flex items-center justify-center disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
