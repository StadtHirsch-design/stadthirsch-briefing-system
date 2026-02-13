import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { queryAI, extractInsights } from '@/lib/openclaw';
import { detectCase, CASE_CONFIGS } from '@/lib/cases';
import { CLICKING_STRATEGIES } from '@/lib/pricken';

// GET: Gesprächshistorie laden
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data });
}

// POST: Neue Nachricht verarbeiten
export async function POST(request: NextRequest) {
  try {
    const { projectId, message, context = [] } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Project ID and message required' }, { status: 400 });
    }

    // 1. Benutzernachricht speichern
    await supabaseAdmin.from('conversations').insert({
      project_id: projectId,
      message,
      role: 'user'
    });

    // 2. Case erkennen (falls noch nicht geschehen)
    const detectedCase = detectCase(message);
    
    if (detectedCase) {
      await supabaseAdmin
        .from('projects')
        .update({ project_type: detectedCase })
        .eq('id', projectId);
    }

    // 3. Insights extrahieren
    const insights = await extractInsights(message, 'general');
    
    for (const insight of insights) {
      await supabaseAdmin.from('insights').insert({
        project_id: projectId,
        category: 'brand_values',
        content: insight,
        confidence: 0.7
      });
    }

    // 4. KI-Antwort generieren
    const caseConfig = detectedCase ? CASE_CONFIGS[detectedCase] : null;
    
    const systemPrompt = `
Du bist ein strategischer Briefing-Experte für die Werbeagentur StadtHirsch.
Deine Aufgabe: Führe ein dialogisches Gespräch, um ein strategisches Briefing zu erarbeiten.

${caseConfig ? `
Erkannter Case: ${caseConfig.name}
Beschreibung: ${caseConfig.description}

Wichtige Fragen für diesen Case:
${caseConfig.initial_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : 'Der Case wurde noch nicht eindeutig erkannt. Stelle allgemeine Eröffnungsfragen.'}

REGELN FÜR DIE KONVERSATION:
1. Stelle NIEMALS mehrere Fragen auf einmal
2. Reagiere auf die Antwort des Kunden und vertiefe das Thema
3. Nutze das "Clicking"-Prinzip: Bleibe bei einer Frage, bis sie erschöpft ist
4. Zeige Empathie und Verständnis für die Branche des Kunden
5. Wenn genug Informationen vorhanden sind, sage: "Ich habe genug Informationen. Ich erstelle jetzt das strategische Briefing."

AKTUELLER KONTEXT:
${context.slice(-3).map((c: any) => `${c.role}: ${c.message}`).join('\n')}
`;

    const aiResponse = await queryAI(message, systemPrompt);

    // 5. KI-Antwort speichern
    const { data: conversationData } = await supabaseAdmin
      .from('conversations')
      .insert({
        project_id: projectId,
        message: aiResponse,
        role: 'assistant',
        metadata: {
          case_detected: detectedCase,
          insights_extracted: insights
        }
      })
      .select()
      .single();

    // 6. Prüfen ob Briefing komplett ist
    const isComplete = aiResponse.includes('Ich erstelle jetzt das strategische Briefing') ||
                      aiResponse.includes('Briefing erstellen') ||
                      aiResponse.includes('strategische Dokument');

    if (isComplete) {
      await supabaseAdmin
        .from('projects')
        .update({ status: 'document' })
        .eq('id', projectId);
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversationData?.id,
      caseDetected: detectedCase,
      isComplete
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
