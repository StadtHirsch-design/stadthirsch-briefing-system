/**
 * COMPONENT: Chat
 * Main chat interface
 */

'use client';

import { Menu, FileText } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

interface ChatProps {
  onOpenSidebar: () => void;
}

export function Chat({ onOpenSidebar }: ChatProps) {
  const { messages, isLoading, messagesEndRef } = useChat();

  return (
    <main className="chat">
      {/* Header */}
      <header className="chat__header">
        <div className="chat__title">
          <button className="chat__menu-btn" onClick={onOpenSidebar}>
            <Menu size={20} />
          </button>
          <span className="chat__project-name">Neues Briefing</span>
        </div>
        
        <div className="chat__actions">
          <button className="btn btn--secondary">
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat__messages">
        <div className="messages">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="typing">
              <div className="message__avatar message__avatar--assistant">
                KI
              </div>
              <div className="typing__bubble">
                <div className="typing__dots">
                  <span className="typing__dot" />
                  <span className="typing__dot" />
                  <span className="typing__dot" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput />
    </main>
  );
}
