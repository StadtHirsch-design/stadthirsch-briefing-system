// OpenClaw Gateway Integration
// Verbindet sich mit dem lokalen Gateway für KI-Anfragen

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface GatewayResponse {
  ok: boolean;
  result?: any;
  error?: string;
}

export async function queryAI(message: string, context?: string): Promise<string> {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`
      },
      body: JSON.stringify({
        message,
        context,
        model: 'openrouter/moonshotai/kimi-k2.5',
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status}`);
    }

    const data: GatewayResponse = await response.json();
    return data.result?.text || 'Keine Antwort erhalten';
  } catch (error) {
    console.error('AI Query error:', error);
    return 'Fehler bei der KI-Anfrage. Bitte später erneut versuchen.';
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
    // Versuche JSON zu parsen
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [response];
  } catch {
    // Fallback: Text als einzelnes Insight
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
