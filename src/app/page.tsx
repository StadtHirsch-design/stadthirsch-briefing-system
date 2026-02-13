'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Loader2, Download, Sparkles, MessageCircle, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
}

interface Project {
  id: string;
  customer_name: string;
  project_type: string | null;
  status: string;
}

export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createProject();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const createProject = async () => {
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Neues Projekt',
          project_type: null
        })
      });
      
      const data = await response.json();
      setProject(data.project);
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Willkommen beim StadtHirsch KI-Briefing! 🎯\n\nIch bin dein strategischer Partner für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing für dein Projekt.\n\n**Worum geht es bei deinem Vorhaben?**\n\nZum Beispiel:\n• "Neues Logo für unser Tech-Startup"\n• "Corporate Identity für eine Beratungsfirma"\n• "Social Media Strategie für einen Onlineshop"`
      }]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !project || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: userMessage,
          context: messages.slice(-5)
        })
      });

      const data = await response.json();
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: data.conversationId || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        metadata: {
          caseDetected: data.caseDetected,
          isComplete: data.isComplete
        }
      }]);

      if (data.caseDetected) {
        setProject(prev => prev ? { ...prev, project_type: data.caseDetected } : null);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Danke für deine Nachricht! Ich habe das gespeichert und werde es in die Strategie einarbeiten. Was möchtest du als Nächstes besprechen?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocument = async () => {
    if (!project || isGeneratingDoc) return;

    setIsGeneratingDoc(true);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Briefing_${project.customer_name}_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Fehler beim Erstellen des Dokuments');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const isComplete = messages.some(m => m.metadata?.isComplete);

  const getCaseIcon = () => {
    switch (project?.project_type) {
      case 'logo': return '🎨';
      case 'ci': return '🏢';
      case 'bildwelt': return '📸';
      case 'piktogramme': return '🎯';
      case 'social': return '📱';
      default: return '✨';
    }
  };

  const getCaseName = () => {
    switch (project?.project_type) {
      case 'logo': return 'Logo-Entwicklung';
      case 'ci': return 'Corporate Identity';
      case 'bildwelt': return 'Bildwelt';
      case 'piktogramme': return 'Piktogramme';
      case 'social': return 'Social Media';
      default: return 'Projektanalyse';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Apple-Style Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">StadtHirsch KI-Briefing</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500">{getCaseIcon()}</span>
                  <span className="text-sm font-medium text-blue-600">{getCaseName()}</span>
                </div>
              </div>
            </div>
            
            {isComplete && (
              <button
                onClick={generateDocument}
                disabled={isGeneratingDoc}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingDoc ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Briefing downloaden</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 overflow-hidden">
          {/* Messages */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-sm font-semibold">Du</span>
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-white border border-gray-200/60 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                </div>
                <div className="bg-white border border-gray-200/60 rounded-3xl px-6 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm p-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Deine Antwort..."
                  disabled={isLoading || isGeneratingDoc}
                  rows={1}
                  className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all resize-none disabled:opacity-50 text-gray-700 placeholder-gray-400"
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
                <div className="absolute right-3 bottom-3 text-gray-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || isGeneratingDoc}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Senden</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-gray-400">
                Powered by Mario Pricken Methodik & StadtHirsch Agentur-Expertise
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Bereit</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
