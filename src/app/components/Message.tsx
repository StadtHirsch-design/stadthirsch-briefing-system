/**
 * COMPONENT: Message
 * Individual message bubble
 */

'use client';

import ReactMarkdown from 'react-markdown';
import type { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <article className={`message ${isUser ? 'message--user' : ''}`}>
      <div className={`message__avatar message__avatar--${message.role}`}>
        {isUser ? 'DU' : 'KI'}
      </div>
      
      <div className="message__content">
        <div className={`message__bubble message__bubble--${message.role}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ marginBottom: '12px' }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
              ul: ({ children }) => <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>{children}</ul>,
              li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
              h1: ({ children }) => <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{children}</h2>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <time className="message__time">
          {message.timestamp.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </time>
      </div>
    </article>
  );
}
