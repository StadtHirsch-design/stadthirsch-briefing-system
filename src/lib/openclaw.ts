// Multi-LLM Integration mit Fallback
// Primär: OpenRouter (Kimi) | Fallback: Gemini

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface LLMResponse {
  content: string;
  model: string;
  latency: number;
}

async function callOpenRouter(message: string, context?: string): Promise<LLMResponse> {
  const startTime = Date.now();
  
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://stadthirsch-briefing-system.vercel.app',
      'X-Title': 'StadtHirsch KI-Briefing'
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2.5',
      messages: [
        ...(context ? [{ role: 'system', content: context }] : []),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices?.[0]?.message?.content || 'Keine Antwort',
    model: 'kimi-k2.5',
    latency: Date.now() - startTime
  };
}

async function callGemini(message: string, context?: string): Promise<LLMResponse> {
  const startTime = Date.now();
  
  const prompt = context ? `${context}\n\n${message}` : message;
  
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort',
    model: 'gemini-2.0-flash',
    latency: Date.now() - startTime
  };
}

export async function queryAI(message: string, context?: string): Promise<string> {
  const errors: string[] = [];
  
  // Versuche Primär-LLM (OpenRouter)
  try {
    console.log('Trying OpenRouter...');
    const result = await callOpenRouter(message, context);
    console.log(`OpenRouter success (${result.latency}ms)`);
    return result.content;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('OpenRouter failed:', errorMsg);
    errors.push(`OpenRouter: ${errorMsg}`);
  }
  
  // Fallback zu Gemini
  if (GEMINI_API_KEY) {
    try {
      console.log('Trying Gemini fallback...');
      const result = await callGemini(message, context);
      console.log(`Gemini fallback success (${result.latency}ms)`);
      return `[Fallback: Gemini] ${result.content}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Gemini failed:', errorMsg);
      errors.push(`Gemini: ${errorMsg}`);
    }
  }
  
  // Beide failed - Fallback-Antwort
  console.error('All LLMs failed:', errors);
  return `Ich habe deine Nachricht erhalten: "${message.substring(0, 100)}..."\n\nLeider haben alle KI-Modelle vorübergehend Probleme. Ich werde deine Eingaben speichern und wir können später das Briefing fortsetzen.`;
}

export async function extractInsights(text: string, category: string): Promise<string[]> {
  const prompt = `Analysiere den Text und extrahiere alle relevanten Informationen für "${category}". Gib als JSON-Array zurück.\n\nText: ${text}`;
  
  const response = await queryAI(prompt);
  
  try {
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [response];
  } catch {
    return [response];
  }
}

export async function generateGoalFormulation(
  product: string,
  benefit: string,
  tone: 'standard' | 'provocative' | 'emotional' = 'standard'
): Promise<string> {
  const templates = {
    standard: `Wie können wir in einer Kampagne vermitteln, dass ${product} ${benefit} bietet?`,
    provocative: `Wie können wir auf provokante Weise darstellen, dass ${product} ${benefit} bietet?`,
    emotional: `Wie können wir emotional erlebbar machen, dass ${product} ${benefit} bietet?`
  };

  const prompt = `Erstelle eine prägnante Zielformulierung (Single-Minded-Proposition) für ${product}.\n\nTemplate: ${templates[tone]}\n\nKriterien: Eine klare Aussage, keine Fachbegriffe, als Frage formulieren.`;

  return await queryAI(prompt);
}

export async function analyzeCompetitors(websiteUrl: string): Promise<{
  competitors: string[];
  positioning: string;
  gaps: string[];
}> {
  const prompt = `Analysiere den Wettbewerb für ${websiteUrl}. Gib JSON zurück: {"competitors": [], "positioning": "", "gaps": []}`;
  
  const response = await queryAI(prompt);
  
  try {
    return JSON.parse(response);
  } catch {
    return { competitors: [], positioning: 'Konnte nicht analysiert werden', gaps: [] };
  }
}
