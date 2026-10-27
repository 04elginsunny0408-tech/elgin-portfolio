'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, X, Send, Sparkles, RotateCcw } from 'lucide-react';

const Iris3DCanvas = dynamic(() => import('./Iris3DCanvas'), { ssr: false });

interface IrisAssistantProps {
  theme: 'space' | 'professional' | 'study';
  irisDisplayName?: string;
  ownerName?: string;
  hideFloatingTrigger?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'iris' | 'user';
  text: string;
  timestamp: string;
  isOwnerMode?: boolean;
}

export default function IrisAssistant({
  theme,
  irisDisplayName = 'Iris',
  ownerName = 'Elgin',
  hideFloatingTrigger = false,
}: IrisAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isOwnerPersonality, setIsOwnerPersonality] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Professional initial greeting (zero visible secret commands)
  useEffect(() => {
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'iris',
        text: `Hello! 👋 I'm ${irisDisplayName}, ${ownerName}'s conversational AI assistant. How can I help you explore his projects, technical expertise, or background today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [irisDisplayName, ownerName]);

  // Occasional friendly greeting bubble
  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubble(`Ask me about ${ownerName}'s work ✨`);
      setTimeout(() => setSpeechBubble(null), 4500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [ownerName]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Global event listener to open Iris chat from anywhere in the app
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 700);
    };
    window.addEventListener('open-iris-chat', handleOpenChat);
    return () => window.removeEventListener('open-iris-chat', handleOpenChat);
  }, []);

  const handleMascotClick = () => {
    setIsBouncing(true);
    setIsOpen((prev) => !prev);
    setTimeout(() => setIsBouncing(false), 700);
  };

  const handleSendMessage = useCallback(async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText ?? inputMessage).trim();
    if (!query || isLoading) return;

    setLastFailedMessage(null);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyMessages = messages
      .filter((m) => m.id !== 'msg_welcome')
      .slice(-8)
      .map((m) => ({ role: m.sender === 'iris' ? 'model' : 'user', text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/iris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          isOwnerMode: isOwnerPersonality,
          history: historyMessages,
        }),
      });

      if (!res.ok) {
        throw new Error('API response error');
      }

      const data = await res.json();

      if (data.modeSwitch === 'owner_enabled') {
        setIsOwnerPersonality(true);
      } else if (data.modeSwitch === 'visitor_enabled') {
        setIsOwnerPersonality(false);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'iris_' + Date.now(),
          sender: 'iris',
          text: data.reply || "I'm having a brief processing moment — please try again!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwnerMode: data.isOwnerMode,
        },
      ]);
    } catch {
      setLastFailedMessage(query);
      setMessages((prev) => [
        ...prev,
        {
          id: 'iris_err_' + Date.now(),
          sender: 'iris',
          text: `I couldn't reach the response service just now. Would you like to retry?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, isOwnerPersonality, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(undefined, lastFailedMessage);
    }
  };

  const accentGradient = isOwnerPersonality
    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
    : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Speech Bubble */}
      {speechBubble && !isOpen && !hideFloatingTrigger && (
        <div
          style={{
            marginBottom: '8px',
            marginRight: '12px',
            padding: '8px 14px',
            borderRadius: '16px',
            borderBottomRightRadius: '2px',
            background: 'var(--bg-surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-active)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-card)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {speechBubble}
        </div>
      )}

      {/* Floating 3D Character & Button Container */}
      {(!hideFloatingTrigger || isOpen) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Toggle Chat Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close chat' : `Chat with ${irisDisplayName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              background: accentGradient,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
            <span>{isOpen ? 'Close' : `Chat with ${irisDisplayName}`}</span>
          </button>

          {/* GENUINE 3D IRIS CANVAS CONTAINER */}
          <div
            style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--bg-surface) 60%, transparent 100%)',
              border: '2px solid var(--border-active)',
              boxShadow: 'var(--border-glow), 0 8px 25px rgba(0, 0, 0, 0.4)',
              overflow: 'visible',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iris3DCanvas
              theme={theme}
              isSpeaking={isLoading}
              isBouncing={isBouncing}
              onClick={handleMascotClick}
              size={90}
            />
          </div>
        </div>
      )}

      {/* CHAT DRAWER */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Iris Conversation Assistant"
          style={{
            position: 'fixed',
            bottom: '115px',
            right: '24px',
            width: 'min(440px, calc(100vw - 32px))',
            height: 'min(600px, calc(100vh - 145px))',
            background: 'var(--bg-surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1.5px solid var(--border-active)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card), 0 0 35px rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9001,
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Iris3DCanvas theme={theme} size={42} isSpeaking={isLoading} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {irisDisplayName}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    3D AI ASSISTANT
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {theme === 'space' ? 'Cosmic Orbital Guide' : theme === 'professional' ? 'Executive Portfolio Assistant' : 'Academic Study Guide'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{ color: 'var(--text-muted)', padding: '6px', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeInUp 0.2s ease',
                }}
              >
                <div
                  style={{
                    padding: '11px 16px',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.sender === 'user' ? '3px' : '16px',
                    borderBottomLeftRadius: msg.sender === 'iris' ? '3px' : '16px',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))'
                        : 'var(--bg-card)',
                    border: msg.sender === 'iris' ? '1px solid var(--border-subtle)' : 'none',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-cyan)', animation: 'spin 2s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{irisDisplayName} is reasoning…</span>
              </div>
            )}

            {lastFailedMessage && !isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleRetry}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Retry Question</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (Zero exposed secret phrases) */}
          <div
            style={{
              padding: '6px 14px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              background: 'var(--bg-surface)',
            }}
          >
            {[
              { label: 'Bharat Yatra (SIH)', text: 'Tell me about the Bharat Yatra SIH platform' },
              { label: 'Technical Stack', text: "What is Elgin's full technical stack?" },
              { label: 'Applied AI', text: 'What AI skills and projects has Elgin built?' },
              { label: 'Connect & Hire', text: 'How can recruiters connect with Elgin?' },
            ].map((q) => (
              <button
                key={q.text}
                onClick={() => handleSendMessage(undefined, q.text)}
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Box with Shift+Enter Support */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              background: 'var(--bg-card)',
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={`Ask ${irisDisplayName} anything about Elgin's work…`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                outline: 'none',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '100px',
                lineHeight: 1.4,
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputMessage.trim() || isLoading ? 0.45 : 1,
                cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
