import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { queryAI, extractInsights } from '@/lib/openclaw';
import { detectCase, CASE_CONFIGS } from '@/lib/cases';

export async function POST(request: NextRequest) {
  try {
    const { projectId, message, context = [] } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Project ID and message required' },
        { status: 400 }
      );
    }

    console.log(`[Chat API] Processing message for project ${projectId}: "${message.substring(0, 50)}..."`);

    // 1. Benutzernachricht speichern
    await supabaseAdmin.from('conversations').insert({
      project_id: projectId,
      message,
      role: 'user'
    });

    // 2. Case erkennen
    const detectedCase = detectCase(message);
    console.log(`[Chat API] Detected case: ${detectedCase || 'none'}`);
    
    if (detectedCase) {
      await supabaseAdmin
        .from('projects')
        .update({ project_type: detectedCase })
        .eq('id', projectId);
    }

    // 3. KI-Antwort generieren
    const caseConfig = detectedCase ? CASE_CONFIGS[detectedCase] : null;
    
    const systemPrompt = `Du bist ein erfahrener Strategie-Berater für die Werbeagentur StadtHirsch.

AUFGABE: Führe ein dialogisches Briefing-Gespräch. Stelle eine Frage nach der anderen.

${caseConfig ? `
ERKANNTER CASE: ${caseConfig.name}
WICHTIGE FRAGEN:
${caseConfig.initial_questions.slice(0, 3).join('\n')}
` : ''}

REGELN:
1. Stelle NUR EINE Frage auf einmal
2. Reagiere auf die Antwort des Kunden
3. Zeige Empathie und Verständnis
4. Nach 3-5 Fragen: "Ich habe genug Informationen. Soll ich das Briefing erstellen?"

KONTEXT:
${context.slice(-2).map((c: any) => `${c.role}: ${c.message}`).join('\n')}`;

    console.log('[Chat API] Calling AI...');
    const aiResponse = await queryAI(message, systemPrompt);
    console.log(`[Chat API] AI response received: "${aiResponse.substring(0, 100)}..."`);

    // 4. KI-Antwort speichern
    const { data: conversationData, error: dbError } = await supabaseAdmin
      .from('conversations')
      .insert({
        project_id: projectId,
        message: aiResponse,
        role: 'assistant',
        metadata: { case_detected: detectedCase }
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Chat API] Database error:', dbError);
    }

    // 5. Prüfen ob Briefing komplett
    const isComplete = aiResponse.toLowerCase().includes('briefing erstellen') ||
                      aiResponse.toLowerCase().includes('dokument erstellen');

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
    console.error('[Chat API] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
