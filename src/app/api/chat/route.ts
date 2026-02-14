/**
 * API Route: /api/chat
 * Echte KI-Integration mit Google Gemini - ROBUSTE VERSION
 */

import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Robust text extraction from Gemini response
function extractTextFromResponse(data: any): string | null {
  console.log('Extracting from response:', JSON.stringify(data, null, 2).slice(0, 500));
  
  // Check for candidates
  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.error('No candidates in response');
    return null;
  }
  
  const candidate = data.candidates[0];
  
  // Check for content
  if (!candidate.content) {
    console.error('No content in candidate, finishReason:', candidate.finishReason);
    
    // Handle safety blocks
    if (candidate.finishReason === 'SAFETY') {
      return 'Entschuldigung, diese Anfrage konnte aus Sicherheitsgründen nicht verarbeitet werden. Bitte formulieren Sie sie anders.';
    }
    if (candidate.finishReason === 'RECITATION') {
      return 'Entschuldigung, diese Anfrage enthält urheberrechtlich geschütztes Material.';
    }
    if (candidate.finishReason === 'OTHER') {
      return 'Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es erneut.';
    }
    
    return null;
  }
  
  // Check for parts
  if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    console.error('No parts in content');
    return null;
  }
  
  // Extract text from first part
  const firstPart = candidate.content.parts[0];
  
  if (typeof firstPart.text === 'string') {
    return firstPart.text;
  }
  
  // Handle function calls (not expected here)
  if (firstPart.functionCall) {
    console.log('Function call detected:', firstPart.functionCall);
    return 'Ich habe eine Funktion aufgerufen.';
  }
  
  console.error('Unexpected part structure:', firstPart);
  return null;
}

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString(36);
  console.log(`[${requestId}] Chat API called`);
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error(`[${requestId}] Failed to parse request body:`, e);
      return NextResponse.json(
        { error: 'Ungültige Anfrage', details: 'JSON konnte nicht geparst werden' },
        { status: 400 }
      );
    }
    
    const { messages, briefing, missingFields, confidence } = body;
    
    console.log(`[${requestId}] Request data:`, { 
      messageCount: messages?.length,
      hasBriefing: !!briefing,
      confidence: confidence,
      geminiConfigured: !!GEMINI_API_KEY
    });

    // Check API key
    if (!GEMINI_API_KEY) {
      console.error(`[${requestId}] GEMINI_API_KEY not configured`);
      return NextResponse.json(
        { error: 'KI nicht konfiguriert', details: 'GEMINI_API_KEY fehlt' },
        { status: 500 }
      );
    }

    // Build conversation history
    const conversationHistory = messages
      ?.filter((msg: any) => msg && msg.role && msg.content)
      ?.filter((msg: any) => msg.role !== 'system')
      ?.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.content) }]
      })) || [];

    console.log(`[${requestId}] Built ${conversationHistory.length} conversation items`);

    // Build briefing summary
    const briefingSummary = Object.entries(briefing || {})
      .filter(([_, value]) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => {
        const readableKey = {
          projectType: 'Projekttyp',
          industry: 'Branche',
          targetAudience: 'Zielgruppe',
          style: 'Stil',
          colors: 'Farben',
          timeline: 'Zeitrahmen',
          budget: 'Budget',
          competitors: 'Wettbewerber',
          likes: 'Was gefällt',
          dislikes: 'Was gefällt nicht',
          uniqueSellingPoints: 'USP'
        }[key] || key;
        
        if (Array.isArray(value)) {
          return `${readableKey}: ${value.join(', ')}`;
        }
        return `${readableKey}: ${value}`;
      })
      .join('\n') || 'Noch keine Informationen erfasst';

    // Build system prompt
    const systemPrompt = `Du bist ein erfahrener KI-Stratege bei der StadtHirsch KI-Agentur.

AUFGABE: Führe ein professionelles Briefing-Gespräch mit dem Kunden. Sammle alle notwendigen Informationen für die 4 Agenten (Research, Creative, Production, Delivery).

KONTEXT:
${briefingSummary}

FEHLENDE INFORMATIONEN:
${(missingFields || []).map((f: string) => {
  const fieldNames: Record<string, string> = {
    projectType: 'Projekttyp (Logo, Social Media, Branding, Video)',
    industry: 'Branche/Industrie',
    targetAudience: 'Zielgruppe',
    style: 'Gewünschter Stil',
    timeline: 'Zeitrahmen'
  };
  return fieldNames[f] || f;
}).join('\n- ') || 'Nichts - Briefing fast vollständig!'}

VOLLSTÄNDIGKEIT: ${Math.round((confidence || 0) * 100)}%

REGELN:
1. Antworte auf Deutsch, kurz und präzise (max 3-4 Sätze)
2. Bezüge dich auf vorherige Nachrichten des Kunden
3. Stelle EINE konkrete Nachfrage zu fehlenden Informationen
4. Bei 80%+ Vollständigkeit: Bestätige Briefing und kündige Agenten-Start an
5. Sei professionell, freundlich, effizient

Wenn das Briefing vollständig ist (Confidence > 80%), schreibe:
"✅ Briefing vollständig! Ich starte jetzt die Agenten."`;

    // Build contents array
    const contents = [];
    
    // Add system prompt as first user message
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    // Add model acknowledgement
    contents.push({
      role: 'model',
      parts: [{ text: 'Verstanden! Ich führe das Briefing-Gespräch professionell und erfasse alle nötigen Informationen.' }]
    });
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      contents.push(...conversationHistory);
    }

    console.log(`[${requestId}] Sending ${contents.length} content items to Gemini`);

    // Call Gemini API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    
    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
          ]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`[${requestId}] Fetch error:`, fetchError);
      return NextResponse.json(
        { error: 'Netzwerkfehler', details: (fetchError as Error).message },
        { status: 503 }
      );
    }

    // Check response status
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[${requestId}] Gemini API error ${response.status}:`, errorText.slice(0, 500));
      return NextResponse.json(
        { error: 'KI-Fehler', status: response.status, details: errorText.slice(0, 200) },
        { status: 500 }
      );
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error(`[${requestId}] Failed to parse Gemini response:`, e);
      return NextResponse.json(
        { error: 'Ungültige KI-Antwort', details: 'JSON konnte nicht geparst werden' },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Gemini response received, parsing...`);
    
    // Extract text
    const aiResponse = extractTextFromResponse(data);
    
    if (!aiResponse) {
      console.error(`[${requestId}] Could not extract text from response`);
      return NextResponse.json(
        { error: 'Leere KI-Antwort', raw: data },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Success! Response: ${aiResponse.slice(0, 100)}...`);

    // Check if briefing is complete
    const isBriefingComplete = 
      aiResponse.includes('✅ Briefing vollständig') || 
      aiResponse.includes('Agenten starten') ||
      aiResponse.includes('starte') && aiResponse.includes('Agent') ||
      (confidence || 0) >= 0.8;

    return NextResponse.json({
      response: aiResponse,
      isBriefingComplete,
      confidence: confidence || 0,
      missingFields: missingFields || []
    });

  } catch (error) {
    console.error(`[${requestId}] Unhandled error:`, error);
    return NextResponse.json(
      { 
        error: 'Server-Fehler', 
        message: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    geminiConfigured: !!GEMINI_API_KEY,
    timestamp: Date.now()
  });
}
