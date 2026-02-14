/**
 * HOOK: useChat - Chat logic and state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from '../types';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `**Willkommen bei StadtHirsch**

Ich bin dein KI-Stratege für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing.

**Womit soll ich dir heute helfen?**`,
  timestamp: new Date()
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ich verstehe. Lass uns "${input.slice(0, 30)}${input.length > 30 ? '...' : ''}" vertiefen.`,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1200);
  }, [input, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleKeyDown,
    messagesEndRef
  };
}
