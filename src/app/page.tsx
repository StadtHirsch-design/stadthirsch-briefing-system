'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Projekt erstellen beim ersten Laden
  useEffect(() => {
    createProject();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      
      // Willkommensnachricht
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Willkommen beim StadtHirsch KI-Briefing-System!\n\nIch werde dir helfen, ein strategisches Briefing für dein Projekt zu entwickeln. Dazu stelle ich dir gezielte Fragen und analysiere deine Antworten.\n\nWorum geht es bei deinem Projekt? (z.B. "Wir brauchen ein neues Logo für unser Startup" oder "Wir wollen unsere Corporate Identity überarbeiten")`
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

    // Benutzernachricht hinzufügen
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

      // KI-Antwort hinzufügen
      setMessages(prev => [...prev, {
        id: data.conversationId || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        metadata: {
          caseDetected: data.caseDetected,
          isComplete: data.isComplete
        }
      }]);

      // Projekt aktualisieren falls Case erkannt
      if (data.caseDetected) {
        setProject(prev => prev ? { ...prev, project_type: data.caseDetected } : null);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.'
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

      // Blob erstellen und downloaden
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stadthirsch-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-stadthirsch-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stadthirsch-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-stadthirsch-900">StadtHirsch KI-Briefing</h1>
              <p className="text-sm text-stadthirsch-600">
                {project?.project_type ? `Case: ${project.project_type.toUpperCase()}` : 'Case wird erkannt...'}
              </p>
            </div>
          </div>
          
          {isComplete && (
            <button
              onClick={generateDocument}
              disabled={isGeneratingDoc}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                isGeneratingDoc 
                  ? "bg-stadthirsch-300 cursor-not-allowed" 
                  : "bg-stadthirsch-600 hover:bg-stadthirsch-700 text-white"
              )}
            >
              {isGeneratingDoc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingDoc ? 'Wird erstellt...' : 'Briefing downloaden'}
            </button>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stadthirsch-200 overflow-hidden">
          {/* Messages */}
          <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? "bg-stadthirsch-600 text-white" 
                    : "bg-stadthirsch-100 text-stadthirsch-700"
                )}>
                  {message.role === 'user' ? 'Du' : 'KI'}
                </div>
                
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-3 whitespace-pre-wrap",
                  message.role === 'user'
                    ? "bg-stadthirsch-600 text-white"
                    : "bg-stadthirsch-50 text-stadthirsch-900"
                )}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stadthirsch-100 flex items-center justify-center">
                  KI
                </div>
                <div className="bg-stadthirsch-50 rounded-2xl px-5 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-stadthirsch-600">Denke nach...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stadthirsch-200 p-4 bg-stadthirsch-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Deine Antwort..."
                disabled={isLoading || isGeneratingDoc}
                className="flex-1 px-4 py-3 rounded-xl border border-stadthirsch-300 focus:outline-none focus:ring-2 focus:ring-stadthirsch-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || isGeneratingDoc}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors",
                  isLoading || !input.trim()
                    ? "bg-stadthirsch-300 cursor-not-allowed"
                    : "bg-stadthirsch-600 hover:bg-stadthirsch-700 text-white"
                )}
              >
                <Send className="w-4 h-4" />
                Senden
              </button>
            </div>
            
            <p className="text-xs text-stadthirsch-500 mt-2 text-center">
              Basierend auf Methodik von Mario Pricken (Kribbeln im Kopf) und StadtHirsch-Agentur-Prozessen
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
