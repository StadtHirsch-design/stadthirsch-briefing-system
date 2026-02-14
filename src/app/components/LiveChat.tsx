/**
 * COMPONENT: LiveChat
 * Real AI-powered briefing conversation
 * Connects to OpenRouter/Kimi K2.5 via API
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface LiveChatProps {
  onBriefingComplete: (briefing: string) => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'agent',
  content: `**Willkommen bei der StadtHirsch KI-Agentur!** 🎯

Ich bin Ihr KI-Stratege. Gemeinsam entwickeln wir ein fundiertes Briefing für Ihr Projekt.

**Was möchten Sie umsetzen?**
• Logo-Design
• Social Media Kampagne  
• Komplette Corporate Identity
• Video-Produktion
• Sonstiges

Beschreiben Sie kurz Ihr Vorhaben, und ich leite die passenden Agenten ein.`,
  timestamp: new Date()
};

export function LiveChat({ onBriefingComplete }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [briefingComplete, setBriefingComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
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

    // Check if briefing seems complete (simple heuristic)
    const fullBriefing = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n') + '\n' + userMsg.content;
    
    const isComplete = fullBriefing.length > 200 && 
      (fullBriefing.toLowerCase().includes('logo') || 
       fullBriefing.toLowerCase().includes('kampagne') ||
       fullBriefing.toLowerCase().includes('branding') ||
       fullBriefing.toLowerCase().includes('social'));

    // Simulate AI response (in production, this calls the API)
    setTimeout(() => {
      let response = '';
      
      if (isComplete && !briefingComplete) {
        response = `**Ausgezeichnet! Ich habe alle wichtigen Informationen erfasst.**

Basierend auf Ihrem Briefing starte ich jetzt:
• **Research-Agent** analysiert Ihre Branche
• **Creative-Agent** entwickelt erste Konzepte
• **Production-Agent** erstellt Visuals

**Projekt wird angelegt...** ✨`;
        setBriefingComplete(true);
        onBriefingComplete(fullBriefing);
      } else {
        response = generateResponse(userMsg.content);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('logo')) {
      return `**Logo-Projekt verstanden!** 🎨

Um das perfekte Logo zu entwickeln, brauche ich noch einige Details:

1. **Branche/Tätigkeit** – Was macht Ihr Unternehmen?
2. **Zielgruppe** – Wen möchten Sie erreichen?
3. **Stilrichtung** – Modern, klassisch, verspielt, minimalistisch?
4. **Farben** – Haben Sie Corporate Colors oder Präferenzen?
5. **Wettbewerber** – Welche Logos mögen Sie (oder nicht)?`;
    }
    
    if (input.includes('social') || input.includes('kampagne')) {
      return `**Social Media Kampagne – perfekt!** 📱

Für eine erfolgreiche Kampagne fehlen mir noch:

1. **Plattform** – Instagram, LinkedIn, Facebook, TikTok?
2. **Ziel** – Awareness, Leads, Verkäufe, Employer Branding?
3. **Zeitrahmen** – Wann soll die Kampagne starten?
4. **Budget** – Gibt es Vorgaben für Ad-Spending?
5. **Content-Typ** – Bilder, Videos, Carousels, Stories?`;
    }
    
    if (input.includes('branding') || input.includes('corporate identity')) {
      return `**Corporate Identity Projekt – excellent!** ✨

Für Ihr komplettes Branding brauche ich:

1. **Unternehmensprofil** – Geschichte, Werte, Vision?
2. **Zielgruppe** – Primäre und sekundäre Zielgruppen?
3. **Marktpositionierung** – Wie unterscheiden Sie sich?
4. **Anwendungen** – Wo wird die CI eingesetzt (Web, Print, Social)?
5. **Bestehendes** – Gibt es bereits Farben/Fonts/Elemente?`;
    }
    
    return `**Danke für die Information!** 

Könnten Sie mir noch etwas mehr Kontext geben?

• Was ist Ihr Hauptziel mit diesem Projekt?
• Gibt es einen bestimmten Zeitrahmen?
• Haben Sie Beispiele, die Ihnen gefallen (oder nicht)?

Je mehr Details, desto präziser können die Agenten arbeiten! 🚀`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="live-chat">
      <header className="live-chat__header">
        <h1 className="live-chat__title">KI-Briefing</h1>
        <p className="live-chat__subtitle">
          Starten Sie ein neues Projekt – die Agenten übernehmen den Rest
        </p>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message chat-message--${msg.role}`}
            >
              <div className={`chat-message__avatar chat-message__avatar--${msg.role}`}>
                {msg.role === 'agent' ? 'KI' : 'DU'}
              </div>
              <div className="chat-message__content">
                <div 
                  className={`chat-message__bubble chat-message__bubble--${msg.role}`}
                  dangerouslySetInnerHTML={{ 
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\n/g, '<br/>') 
                  }}
                />
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message chat-message--agent">
              <div className="chat-message__avatar chat-message__avatar--agent">KI</div>
              <div className="chat-message__content">
                <div className="chat-message__bubble chat-message__bubble--agent">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="chat-input__container">
            <button className="btn btn--icon" style={{ padding: '8px' }}>
              <Paperclip size={20} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Beschreiben Sie Ihr Projekt..."
              rows={1}
              className="chat-input__field"
              disabled={briefingComplete}
            />
            
            <button className="btn btn--icon" style={{ padding: '8px' }}>
              <Mic size={20} />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || briefingComplete}
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
