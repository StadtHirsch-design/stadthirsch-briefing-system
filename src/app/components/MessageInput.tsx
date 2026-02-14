/**
 * COMPONENT: MessageInput
 * Chat input field
 */

'use client';

import { Paperclip, Mic, Send, Loader2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';

export function MessageInput() {
  const { input, setInput, isLoading, sendMessage, handleKeyDown } = useChat();

  return (
    <div className="chat__input">
      <div className="input">
        <div className="input__container">
          <button className="btn btn--icon" style={{ flexShrink: 0 }}>
            <Paperclip size={18} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Beschreibe dein Projekt..."
            rows={1}
            className="input__field"
          />
          
          <div className="input__actions">
            <button className="btn btn--icon" style={{ flexShrink: 0 }}>
              <Mic size={18} />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="btn btn--send"
              style={{ flexShrink: 0 }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        
        <p className="input__hint">
          Drücke Enter zum Senden • Shift+Enter für neue Zeile
        </p>
      </div>
    </div>
  );
}
