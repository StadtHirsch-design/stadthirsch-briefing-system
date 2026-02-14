/**
 * API Route: /api/chat
 * Echte KI-Integration mit Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
}

interface BriefingContext {
  projectType?: string;
  industry?: string;
  targetAudience?: string;
  style?: string;
  colors?: string[];
  timeline?: string;
  budget?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, briefing, missingFields, confidence } = await request.json();

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'KI nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Build conversation history for Gemini
    const conversationHistory = messages.map((msg: ChatMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Build briefing context string
    const briefingContext = Object.entries(briefing || {})
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n') || 'Noch keine Informationen erfasst';

    // Build system prompt with context
    const systemPrompt = `Du bist ein erfahrener KI-Stratege bei der StadtHirsch KI-Agentur, einer vollautomatisierten Werbe- und Grafikagentur.

DEINE AUFGABE:
Führe ein professionelles Briefing-Gespräch mit dem Kunden. Sammle alle notwendigen Informationen für die 4 Agenten (Research, Creative, Production, Delivery).

WICHTIGE REGELN:
1. ERINNERE DICH an ALLE vorherigen Nachrichten im Gespräch
2. Stelle GEZIELTE Nachfragen basierend auf fehlenden Informationen
3. Extrahiere automatisch: Branche, Zielgruppe, Stil, Farben, Zeitrahmen
4. Bei Confidence > 80%: Bestätige Briefing und kündige Agenten-Start an
5. Sei professionell, freundlich und präzise

KONTEXT:
- Bisher erfasst: ${briefingContext}
- Fehlend: ${missingFields?.join(', ') || 'nichts'}
- Vollständigkeit: ${Math.round((confidence || 0) * 100)}%

Wenn das Briefing vollständig ist (Confidence > 80%), sage:
"✅ Briefing vollständig! Ich starte jetzt die Agenten..."`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...conversationHistory
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'KI-Fehler', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', data);
      return NextResponse.json(
        { error: 'Keine KI-Antwort' },
        { status: 500 }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Check if briefing is complete based on AI response
    const isBriefingComplete = aiResponse.includes('✅ Briefing vollständig') || 
                               aiResponse.includes('Agenten starten') ||
                               confidence >= 0.8;

    return NextResponse.json({
      response: aiResponse,
      isBriefingComplete,
      confidence,
      missingFields
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Server-Fehler', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    geminiConfigured: !!GEMINI_API_KEY
  });
}
