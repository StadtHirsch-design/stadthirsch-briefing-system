/**
 * COMPONENT: LiveChat
 * Echte KI-Briefing-Konversation mit Gemini API
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Paperclip, RefreshCw } from 'lucide-react';
import { useConversationMemory } from '../hooks/useConversationMemory';
import type { ConversationMessage } from '../types/conversation';

interface LiveChatProps {
  onBriefingComplete: (briefing: Record<string, any>) => void;
}

export function LiveChat({ onBriefingComplete }: LiveChatProps) {
  const { 
    memory, 
    addMessage, 
    getContextForAI, 
    isBriefingComplete, 
    resetMemory,
    getFullBriefing,
    isInitialized 
  } = useConversationMemory();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentWelcome = useRef(false);

  // Send welcome message on first load
  useEffect(() => {
    if (isInitialized && !hasSentWelcome.current && memory.messages.length === 0) {
      hasSentWelcome.current = true;
      const welcomeMsg = `Willkommen bei der StadtHirsch KI-Agentur! 🎯

Ich bin Ihr KI-Stratege. Gemeinsam entwickeln wir ein fundiertes Briefing für Ihr Projekt.

**Was möchten Sie umsetzen?**
• Logo-Design
• Social Media Kampagne  
• Komplette Corporate Identity
• Video-Produktion
• Sonstiges

Beschreiben Sie kurz Ihr Vorhaben.`;
      
      addMessage('agent', welcomeMsg);
    }
  }, [isInitialized, memory.messages.length, addMessage]);

  // Check if briefing is complete
  useEffect(() => {
    if (isBriefingComplete() && memory.stage === 'confirmation') {
      // Briefing complete - trigger agent start
      setTimeout(() => {
        onBriefingComplete(getFullBriefing());
      }, 2000);
    }
  }, [memory.stage, isBriefingComplete, getFullBriefing, onBriefingComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [memory.messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    // Add user message to memory
    addMessage('user', userContent);

    try {
      // Get context for AI
      const context = getContextForAI();
      
      // Prepare messages for API
      const apiMessages = memory.messages.map((msg: ConversationMessage) => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          briefing: memory.briefing,
          missingFields: memory.missingFields,
          confidence: memory.confidence
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API-Fehler');
      }

      const data = await response.json();
      
      // Add AI response to memory
      addMessage('agent', data.response);

      // Check if briefing is complete according to AI
      if (data.isBriefingComplete && memory.stage !== 'complete') {
        addMessage('system', 'Briefing vollständig - Agenten werden gestartet...');
      }

    } catch (err) {
      console.error('Chat error:', err);
      setError((err as Error).message);
      
      // Add error message
      addMessage('agent', 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    if (confirm('Möchten Sie das Gespräch wirklich zurücksetzen?')) {
      resetMemory();
      hasSentWelcome.current = false;
    }
  };

  // Format message with markdown-like syntax
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•/g, '&bull;')
      .replace(/\n/g, '<br/>');
  };

  if (!isInitialized) {
    return (
      <div className="live-chat">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="live-chat">
      <header className="live-chat__header">
        <div>
          <h1 className="live-chat__title">KI-Briefing</h1>
          <p className="live-chat__subtitle">
            {memory.stage === 'initial' && ' Starten Sie ein neues Projekt'}
            {memory.stage === 'exploring' && '🎯 Projekttyp erkannt - Details erfassen'}
            {memory.stage === 'deep_dive' && '📝 Fast fertig - noch ein paar Fragen'}
            {memory.stage === 'confirmation' && '✅ Briefing fast vollständig'}
            {memory.stage === 'complete' && '🚀 Agenten werden gestartet...'}
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="btn btn--icon"
          title="Gespräch zurücksetzen"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Briefing Progress */}
      <div style={{ 
        padding: '12px 20px', 
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Briefing-Vollständigkeit</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: memory.confidence > 0.6 ? '#10b981' : 'var(--color-text-muted)' }}>
            {Math.round(memory.confidence * 100)}%
          </span>
        </div>
        <div style={{ 
          height: '4px', 
          background: 'var(--color-bg-tertiary)', 
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${memory.confidence * 100}%`,
            height: '100%',
            background: memory.confidence > 0.8 ? '#10b981' : memory.confidence > 0.5 ? '#f59e0b' : '#3b82f6',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        {memory.missingFields.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Noch offen: {memory.missingFields.join(', ')}
          </div>
        )}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {memory.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message chat-message--${msg.role}`}
            >
              <div className={`chat-message__avatar chat-message__avatar--${msg.role}`}>
                {msg.role === 'agent' ? 'KI' : msg.role === 'user' ? 'DU' : '✓'}
              </div>
              <div className="chat-message__content">
                <div 
                  className={`chat-message__bubble chat-message__bubble--${msg.role}`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message chat-message--agent">
              <div className="chat-message__avatar chat-message__avatar--agent">KI</div>
              <div className="chat-message__content">
                <div className="chat-message__bubble chat-message__bubble--agent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Denke nach...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div style={{ 
            padding: '12px 20px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="chat-input">
          <div className="chat-input__container">
            <button className="btn btn--icon" style={{ padding: '8px' }} disabled={isLoading}>
              <Paperclip size={20} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={memory.stage === 'complete' ? 'Briefing abgeschlossen...' : 'Beschreiben Sie Ihr Projekt...'}
              rows={1}
              className="chat-input__field"
              disabled={isLoading || memory.stage === 'complete'}
            />
            
            <button className="btn btn--icon" style={{ padding: '8px' }} disabled={isLoading}>
              <Mic size={20} />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || memory.stage === 'complete'}
              className="btn btn--accent"
              style={{ padding: '10px 16px' }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
