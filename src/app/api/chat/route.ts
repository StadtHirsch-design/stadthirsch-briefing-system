import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { queryAI } from '@/lib/openclaw';
import { detectCase, CASE_CONFIGS } from '@/lib/cases';
import { CLICKING_STRATEGIES } from '@/lib/pricken';

export async function POST(request: NextRequest) {
  try {
    const { projectId, message } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Project ID and message required' },
        { status: 400 }
      );
    }

    console.log(`[Chat API] New message for project ${projectId}: "${message.substring(0, 50)}..."`);

    // 1. Kompletten Gesprächsverlauf aus Supabase laden (letzte 20 Nachrichten)
    const { data: conversationHistory, error: historyError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (historyError) {
      console.error('[Chat API] Error loading history:', historyError);
    }

    // 2. Benutzernachricht speichern
    await supabaseAdmin.from('conversations').insert({
      project_id: projectId,
      message,
      role: 'user'
    });

    // 3. Case erkennen (nur beim ersten Mal oder wenn noch nicht klar)
    const currentProject = await supabaseAdmin
      .from('projects')
      .select('project_type')
      .eq('id', projectId)
      .single();
    
    let detectedCase = currentProject.data?.project_type;
    if (!detectedCase) {
      detectedCase = detectCase(message);
      console.log(`[Chat API] Detected case: ${detectedCase}`);
      
      if (detectedCase) {
        await supabaseAdmin
          .from('projects')
          .update({ project_type: detectedCase })
          .eq('id', projectId);
      }
    }

    // 4. Build conversation context for AI
    const caseConfig = detectedCase ? CASE_CONFIGS[detectedCase] : null;
    const conversationCount = conversationHistory?.length || 0;
    
    // Format conversation history for AI context
    const formattedHistory = conversationHistory?.map((msg: any) => ({
      role: msg.role,
      content: msg.message
    })) || [];

    // Add current message to history
    formattedHistory.push({ role: 'user', content: message });

    // System prompt with full context awareness
    const systemPrompt = `Du bist ein erfahrener Strategie-Berater für die Werbeagentur StadtHirsch, spezialisiert auf die Mario Pricken Methodik.

${caseConfig ? `
ERKANNTER CASE: ${caseConfig.name}
Beschreibung: ${caseConfig.description}

WICHTIGE FRAGEN FÜR DIESEN CASE:
${caseConfig.initial_questions.join('\n')}

BERECHEN DIE KOMMUNIKATIONSSTRATEGIE:
${caseConfig.strategy_questions.join('\n')}
` : ''}

REGELN FÜR DAS GESPRÄCH:
1. LIES Den gesamten bisherigen Gesprächsverlauf SORGFÄLTIG durch
2. Reagiere auf ALLE vorherigen Antworten des Kunden
3. Stelle logische Folgefragen basierend auf dem bisher Gesagten
4. Vermeide Wiederholungen von Fragen, die schon beantwortet wurden
5. Nutze das "Clicking"-Prinzip: Vertiefe eine Frage, bevor du zur nächsten gehst
6. Zeige Empathie und fühle dich in die Situation des Kunden ein
7. Nachdem du 5-8 wichtige Informationen gesammelt hast, frage: "Ich habe jetzt genug Informationen. Soll ich das strategische Briefing erstellen?"

KOMMUNIKATIONSSTIL:
- Professionell, aber warm und empathisch
- Keine Fachbegriffe ohne Erklärung
- Stelle maximal EINE Frage auf einmal
- Summarisiere regelmäßig das bisher Gesagte, um zu zeigen, dass du zuhörst

Dies ist Nachricht ${conversationCount + 1} im Gespräch.`;

    console.log(`[Chat API] Sending ${formattedHistory.length} messages to AI`);

    // 5. KI-Antwort generieren mit vollständigem Kontext
    const aiResponse = await queryAIWithHistory(formattedHistory, systemPrompt);

    // 6. KI-Antwort speichern
    const { data: conversationData, error: dbError } = await supabaseAdmin
      .from('conversations')
      .insert({
        project_id: projectId,
        message: aiResponse,
        role: 'assistant',
        metadata: { 
          case_detected: detectedCase,
          conversation_turn: conversationCount + 1
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Chat API] Database error:', dbError);
    }

    // 7. Prüfen ob Briefing komplett ist
    const isComplete = aiResponse.toLowerCase().includes('soll ich das strategische brief') ||
                      aiResponse.toLowerCase().includes('briefing erstellen') ||
                      aiResponse.toLowerCase().includes('genug informationen');

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
      isComplete,
      conversationTurn: conversationCount + 1
    });

  } catch (error) {
    console.error('[Chat API] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// New function to handle conversation history
async function queryAIWithHistory(history: Array<{role: string, content: string}>, systemPrompt: string): Promise<string> {
  // Format messages for OpenRouter
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stadthirsch-briefing-system.vercel.app',
        'X-Title': 'StadtHirsch KI-Briefing'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Keine Antwort';
  } catch (error) {
    console.error('[queryAIWithHistory] Error:', error);
    
    // Fallback to simple queryAI
    const { queryAI } = await import('@/lib/openclaw');
    return await queryAI(history[history.length - 1]?.content || '', systemPrompt);
  }
}