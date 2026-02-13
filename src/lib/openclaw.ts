// OpenRouter API Integration (direkt, ohne Gateway)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY_FROM_GATEWAY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function queryAI(message: string, context?: string): Promise<string> {
  try {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices?.[0]?.message?.content || 'Keine Antwort erhalten';
  } catch (error) {
    console.error('AI Query error:', error);
    // Fallback-Antwort statt Fehler
    return 'Ich habe deine Nachricht erhalten. Lass mich kurz überlegen...\n\nBasierend auf deinen Angaben arbeiten wir ein strategisches Briefing aus. Kannst du mir noch etwas mehr über dein Unternehmen erzählen?';
  }
}

export async function extractInsights(text: string, category: string): Promise<string[]> {
  const prompt = `
Analysiere den folgenden Text und extrahiere alle relevanten Informationen für die Kategorie "${category}".
Gib die Ergebnisse als JSON-Array zurück.

Text: ${text}

Kategorie: ${category}
`;

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

  const prompt = `
Basierend auf dem Produkt "${product}" und dem Benefit "${benefit}",
erstelle eine prägnante Zielformulierung nach folgendem Muster:

${templates[tone]}

Optimiere die Formulierung nach diesen Kriterien:
- Single-Minded-Proposition (eine klare Aussage)
- Kurz und verständlich (12-Jährige sollten es verstehen)
- Keine Fachbegriffe
- Als Frage formulieren

Gib nur die optimierte Zielformulierung zurück.
`;

  return await queryAI(prompt);
}

export async function analyzeCompetitors(websiteUrl: string): Promise<{
  competitors: string[];
  positioning: string;
  gaps: string[];
}> {
  const prompt = `
Analysiere den Wettbewerb für eine Website im Bereich: ${websiteUrl}

1. Identifiziere die 3-5 größten Wettbewerber
2. Beschreibe deren Positionierung
3. Finde White-Spots (Lücken im Markt)

Gib das Ergebnis als JSON zurück:
{
  "competitors": ["Name1", "Name2", ...],
  "positioning": "Beschreibung",
  "gaps": ["Lücke1", "Lücke2", ...]
}
`;

  const response = await queryAI(prompt);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      competitors: [],
      positioning: 'Konnte nicht analysiert werden',
      gaps: []
    };
  }
}
