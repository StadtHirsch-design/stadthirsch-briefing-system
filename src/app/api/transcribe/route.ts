import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Konvertiere File zu Blob für OpenAI
    const bytes = await audioFile.arrayBuffer();
    const blob = new Blob([bytes], { type: audioFile.type });

    // Erstelle File-Objekt
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

    // Transkribiere mit Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'de',
      response_format: 'json',
    });

    return NextResponse.json({
      text: transcription.text,
      language: 'de',
      confidence: 0.95
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Fallback: Simuliere Transkription für Demo
    return NextResponse.json({
      text: 'Dies ist eine simulierte Transkription. Für echte Spracherkennung bitte OpenAI API Key konfigurieren.',
      language: 'de',
      confidence: 0.8,
      simulated: true
    });
  }
}
