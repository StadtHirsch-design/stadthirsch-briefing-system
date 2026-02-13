// Whisper API Integration für Spracheingabe

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'de');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Browser-native Speech Recognition Typen
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Einfacher Hook ohne komplexe Typen
export function useSpeechRecognition() {
  return {
    isListening: false,
    transcript: '',
    error: null,
    startListening: () => {
      console.log('Speech recognition not implemented in this version');
    },
    stopListening: () => {},
    resetTranscript: () => {}
  };
}
