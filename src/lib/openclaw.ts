import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// API-Keys aus Environment
const getOpenRouterKey = () => process.env.OPENROUTER_API_KEY || '';
const getGeminiKey = () => process.env.GEMINI_API_KEY || '';

interface LLMResponse {
  content: string;
  model: string;
  latency: number;
}

async function callOpenRouter(message: string, context?: string): Promise<LLMResponse> {
  const startTime = Date.now();
  const apiKey = getOpenRouterKey();
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://stadthirsch-briefing-system.vercel.app',
      'X-Title': 'StadtHirsch KI-Briefing'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        ...(context ? [{ role: 'system', content: context }] : []),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices?.[0]?.message?.content || 'Keine Antwort',
    model: 'gpt-4o-mini',
    latency: Date.now() - startTime
  };
}

async function callGemini(message: string, context?: string): Promise<LLMResponse> {
  const startTime = Date.now();
  const apiKey = getGeminiKey();
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const prompt = context ? `${context}\n\n${message}` : message;
  
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort',
    model: 'gemini-2.0-flash',
    latency: Date.now() - startTime
  };
}

export async function queryAI(message: string, context?: string): Promise<string> {
  console.log(`[queryAI] Processing message: "${message.substring(0, 50)}..."`);
  
  const errors: string[] = [];
  
  // Versuche OpenRouter
  try {
    console.log('[queryAI] Trying OpenRouter...');
    const result = await callOpenRouter(message, context);
    console.log(`[queryAI] OpenRouter success (${result.latency}ms)`);
    return result.content;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[queryAI] OpenRouter failed:', errorMsg);
    errors.push(`OpenRouter: ${errorMsg}`);
  }
  
  // Fallback zu Gemini
  try {
    console.log('[queryAI] Trying Gemini fallback...');
    const result = await callGemini(message, context);
    console.log(`[queryAI] Gemini success (${result.latency}ms)`);
    return result.content;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[queryAI] Gemini failed:', errorMsg);
    errors.push(`Gemini: ${errorMsg}`);
  }
  
  // Beide failed
  console.error('[queryAI] All LLMs failed:', errors);
  throw new Error(`KI-Services nicht verfügbar: ${errors.join(', ')}`);
}

export async function extractInsights(text: string, category: string): Promise<string[]> {
  try {
    const prompt = `Extrahiere aus diesem Text die wichtigsten Informationen für "${category}".\n\nText: ${text}\n\nGib die Ergebnisse als einfache Liste zurück.`;
    const response = await queryAI(prompt);
    return response.split('\n').filter(line => line.trim()).slice(0, 5);
  } catch (error) {
    console.error('[extractInsights] Error:', error);
    return [];
  }
}
