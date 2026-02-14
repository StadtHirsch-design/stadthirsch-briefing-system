/**
 * COMPONENT: LiveChat - SIMPLE & CLEAN VERSION
 * Echte KI-Briefing-Konversation mit Gemini API
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

interface LiveChatProps {
  onBriefingComplete: (briefing: Record<string, any>) => void;
}

export function LiveChat({ onBriefingComplete }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: 'Willkommen bei der StadtHirsch KI-Agentur! 🎯\n\nIch bin Ihr KI-Stratege. Beschreiben Sie kurz Ihr Projekt (Logo, Social Media, Branding...).'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    console.log('[LiveChat] Sending message:', trimmedInput);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      // Prepare API request
      const apiMessages = [...messages, userMsg].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('[LiveChat] Calling API with', apiMessages.length, 'messages');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          briefing: {},
          missingFields: [],
          confidence: 0
        })
      });

      console.log('[LiveChat] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LiveChat] API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
      }

      const data = await response.json();
      console.log('[LiveChat] API data:', data);

      if (!data.response) {
        console.error('[LiveChat] No response in data:', data);
        throw new Error('Keine Antwort von der KI');
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.response
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Check if briefing complete
      if (data.isBriefingComplete) {
        console.log('[LiveChat] Briefing complete!');
        setTimeout(() => onBriefingComplete({}), 1500);
      }

    } catch (err) {
      console.error('[LiveChat] Error:', err);
      setError((err as Error).message);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: `⚠️ Fehler: ${(err as Error).message}. Bitte versuchen Sie es erneut.`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, onBriefingComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    if (confirm('Gespräch zurücksetzen?')) {
      setMessages([{
        id: 'welcome',
        role: 'agent',
        content: 'Willkommen bei der StadtHirsch KI-Agentur! 🎯\n\nBeschreiben Sie kurz Ihr Projekt.'
      }]);
      setError(null);
    }
  };

  return (
    <div className="live-chat">
      <header className="live-chat__header">
        <div>
          <h1 className="live-chat__title">KI-Briefing</h1>
          {error && <p style={{ color: '#ef4444', fontSize: '12px' }}>⚠️ {error}</p>}
        </div>
        <button onClick={handleReset} className="btn btn--icon" title="Zurücksetzen">
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              <div className={`chat-message__avatar chat-message__avatar--${msg.role}`}>
                {msg.role === 'agent' ? 'KI' : 'DU'}
              </div>
              <div className="chat-message__content">
                <div 
                  className={`chat-message__bubble chat-message__bubble--${msg.role}`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message chat-message--agent">
              <div className="chat-message__avatar chat-message__avatar--agent">KI</div>
              <div className="chat-message__content">
                <div className="chat-message__bubble chat-message__bubble--agent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Schreibt...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="chat-input__container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ihre Nachricht..."
              rows={1}
              className="chat-input__field"
              disabled={isLoading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="btn btn--accent"
              style={{ padding: '10px 16px', opacity: isLoading || !input.trim() ? 0.5 : 1 }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
