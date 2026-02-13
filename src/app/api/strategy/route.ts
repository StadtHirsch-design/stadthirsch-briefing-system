import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { queryAI } from '@/lib/openclaw';
import { CLICKING_STRATEGIES, GOAL_FORMULATION_TEMPLATES } from '@/lib/pricken';

// GET: Clicking-Strategien für einen Case
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseType = searchParams.get('case');
  const projectId = searchParams.get('projectId');

  if (!caseType) {
    // Alle Strategien zurückgeben
    return NextResponse.json({ 
      strategies: CLICKING_STRATEGIES,
      templates: GOAL_FORMULATION_TEMPLATES
    });
  }

  // Relevante Strategien für den Case filtern
  const relevantStrategies = CLICKING_STRATEGIES.filter(s => {
    switch (caseType) {
      case 'ci':
        return ['symbol', 'metapher', 'uebertreibung', 'perspektivwechsel'].includes(s.id);
      case 'logo':
        return ['ohne_worte', 'symbol', 'drehung_180', 'vereinfachung'].includes(s.id);
      case 'bildwelt':
        return ['sinneskanaele', 'perspektivwechsel', 'zeitlinie', 'geschichten'].includes(s.id);
      case 'piktogramme':
        return ['symbol', 'vereinfachung', 'ohne_worte'].includes(s.id);
      case 'social':
        return ['geschichten', 'provokation', 'doppeldeutig', 'reframing'].includes(s.id);
      default:
        return true;
    }
  });

  return NextResponse.json({ strategies: relevantStrategies });
}

// POST: Zielformulierung generieren
export async function POST(request: NextRequest) {
  try {
    const { projectId, product, benefit, tone = 'standard' } = await request.json();

    if (!projectId || !product || !benefit) {
      return NextResponse.json(
        { error: 'Project ID, product and benefit required' },
        { status: 400 }
      );
    }

    // Zielformulierung generieren
    const prompt = `
Erstelle eine prägnante Zielformulierung (Single-Minded-Proposition) für folgendes Produkt:

Produkt: ${product}
Hauptbenefit: ${benefit}
Tonality: ${tone}

Kriterien für die Zielformulierung:
1. Eine klare Aussage (Single-Minded)
2. Kein "und" verwenden
3. Als Frage formulieren: "Wie können wir..."
4. Kurz und verständlich (12-Jährige sollten es verstehen)
5. Keine Fremdwörter oder Fachbegriffe

Gib nur die Zielformulierung zurück, keine Erklärungen.
`;

    const goalFormulation = await queryAI(prompt);

    // Als Insight speichern
    await supabaseAdmin.from('insights').insert({
      project_id: projectId,
      category: 'goals',
      content: goalFormulation,
      confidence: 0.85
    });

    return NextResponse.json({ 
      goal_formulation: goalFormulation,
      templates_used: GOAL_FORMULATION_TEMPLATES
    });

  } catch (error) {
    console.error('Strategy generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy' },
      { status: 500 }
    );
  }
}
