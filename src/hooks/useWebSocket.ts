// WebSocket Hook für Echtzeit-Updates
'use client';

import { useEffect, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'complete' | 'error';
  data: any;
}

export function useWebSocket(projectId: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Für jetzt: Polling-basiert (Vercel Edge Functions haben 10s Timeout)
    // Später: Supabase Realtime oder Pusher
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat?projectId=${projectId}`);
        const data = await res.json();
        
        if (data.conversations?.length > 0) {
          const lastMsg = data.conversations[data.conversations.length - 1];
          setLastMessage({
            type: lastMsg.role === 'assistant' ? 'message' : 'typing',
            data: lastMsg
          });
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!projectId) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message })
      });
      
      return await res.json();
    } catch (e) {
      console.error('Send error:', e);
      throw e;
    }
  }, [projectId]);

  return { isConnected, lastMessage, sendMessage };
}
