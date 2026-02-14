'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transkription fehlgeschlagen');
          
          const data = await response.json();
          onTranscript(data.text);
        } catch (e) {
          setError('Fehler bei der Verarbeitung');
          console.error(e);
        } finally {
          setIsProcessing(false);
          setIsListening(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (e) {
      setError('Mikrofon-Zugriff verweigert');
      console.error(e);
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  if (disabled) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`p-2.5 rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-apple-red/10 text-apple-red animate-pulse'
            : 'bg-apple-gray-6 text-[var(--text-secondary)] hover:bg-apple-gray-5'
        } disabled:opacity-40`}
        title={isListening ? 'Aufnahme stoppen' : 'Spracheingabe'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {isListening && (
        <span className="text-sm text-apple-red font-medium">
          Höre zu...
        </span>
      )}
      
      {error && (
        <span className="text-sm text-apple-red">
          {error}
        </span>
      )}
    </div>
  );
}
