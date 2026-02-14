/**
 * API Route: /api/chat
 * Echte KI-Integration mit Google Gemini - DEBUG VERSION
 */

import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, briefing, missingFields, confidence } = body;

    console.log('Chat API called with:', { 
      messageCount: messages?.length, 
      confidence,
      geminiConfigured: !!GEMINI_API_KEY 
    });

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'KI nicht konfiguriert', details: 'GEMINI_API_KEY fehlt' },
        { status: 500 }
      );
    }

    // Build conversation history for Gemini
    // Gemini expects: user, model (not agent)
    const conversationHistory = messages
      ?.filter((msg: any) => msg.role !== 'system') // Filter out system messages
      ?.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || [];

    console.log('Conversation history:', conversationHistory.length, 'messages');

    // Build briefing context string
    const briefingContext = Object.entries(briefing || {})
      .filter(([_, value]) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n') || 'Noch keine Informationen erfasst';

    // Build the full prompt
    const systemPrompt = `Du bist ein erfahrener KI-Stratege bei der StadtHirsch KI-Agentur.

AUFGABE: Führe ein professionelles Briefing-Gespräch. Stelle gezielte Nachfragen.

KONTEXT:
- Bisher erfasst: ${briefingContext}
- Fehlend: ${missingFields?.join(', ') || 'nichts'}
- Vollständigkeit: ${Math.round((confidence || 0) * 100)}%

Regeln:
1. Beziehe dich auf vorherige Nachrichten
2. Stelle eine konkrete Nachfrage
3. Bei 80%+ Vollständigkeit: Starte die Agenten

Antworte auf Deutsch. Kurz und präzise.`;

    // Build contents array - first user message with system prompt
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add conversation history
    if (conversationHistory.length > 0) {
      contents.push(...conversationHistory);
    }

    console.log('Calling Gemini API with', contents.length, 'content items');

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'KI-Fehler', status: response.status, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Gemini response received:', !!data.candidates);
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', data);
      return NextResponse.json(
        { error: 'Keine KI-Antwort', data },
        { status: 500 }
      );
    }

    const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.error('Empty response from Gemini');
      return NextResponse.json(
        { error: 'Leere KI-Antwort' },
        { status: 500 }
      );
    }

    // Check if briefing is complete
    const isBriefingComplete = aiResponse.includes('✅ Briefing vollständig') || 
                               aiResponse.includes('Agenten starten') ||
                               aiResponse.includes('starte') && aiResponse.includes('Agent') ||
                               confidence >= 0.8;

    console.log('Sending response:', aiResponse.slice(0, 100) + '...');

    return NextResponse.json({
      response: aiResponse,
      isBriefingComplete,
      confidence,
      missingFields
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Server-Fehler', message: (error as Error).message, stack: (error as Error).stack },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    geminiConfigured: !!GEMINI_API_KEY,
    keyPreview: GEMINI_API_KEY ? `${GEMINI_API_KEY.slice(0, 8)}...` : null
  });
}
