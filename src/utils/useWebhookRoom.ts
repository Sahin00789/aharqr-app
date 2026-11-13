import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/auth-store';

export interface WebhookRoomEvent {
  event: string;
  roomId?: string;
  message?: string;
  data?: unknown;
  timestamp?: string;
  activeClientsInRoom?: number;
}

export function useWebhookRoom(roomId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebhookRoomEvent | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const urlIndexRef = useRef(0);

  useEffect(() => {
    if (!roomId || !accessToken) {
      return;
    }

    let isUnmounted = false;

    // Construct candidate WebSocket URLs
    const getCandidateUrls = (): string[] => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname || 'localhost';
      const host = window.location.host || 'localhost:5173';

      const envWsUrl = import.meta.env.VITE_WS_URL;
      const candidates: string[] = [];

      if (envWsUrl) {
        candidates.push(`${envWsUrl.replace(/\/$/, '')}/ws/webhook-room/${roomId}`);
      }

      // Candidate 1: Direct backend port 3000
      candidates.push(`${protocol}//${hostname}:3000/ws/webhook-room/${roomId}`);

      // Candidate 2: Vite proxy /ws path
      candidates.push(`${protocol}//${host}/ws/webhook-room/${roomId}`);

      return candidates;
    };

    const candidateUrls = getCandidateUrls();

    const connect = () => {
      if (isUnmounted) return;
      setIsConnected(false);

      const wsUrl = candidateUrls[urlIndexRef.current % candidateUrls.length];
      console.log(`📡 [Frontend WebSocket] Connecting to Webhook Room [${roomId}] at ${wsUrl}...`);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          ws.send(JSON.stringify({ event: 'AUTH', token: accessToken }));
          attemptsRef.current = 0;
          console.log(`🚀 [Frontend WebSocket] CONNECTED to Webhook Room [${roomId}]!`);

          // Heartbeat PING interval every 15s
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: 'PING', roomId, timestamp: new Date().toISOString() }));
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const parsed: WebhookRoomEvent = JSON.parse(event.data);
            if (parsed.event === 'ROOM_CONNECTED') {
              setIsConnected(true);
              return;
            }
            if (parsed.event !== 'PONG') {
              setLastEvent(parsed);
            }
          } catch {
            console.log(`📩 [Frontend WebSocket] Message received:`, event.data);
          }
        };

        ws.onerror = () => {
          if (!isUnmounted) setIsConnected(false);
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          attemptsRef.current += 1;
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

          urlIndexRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch {
        if (!isUnmounted) {
          setIsConnected(false);
          urlIndexRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [accessToken, roomId]);

  return { isConnected: Boolean(roomId && accessToken) && isConnected, lastEvent };
}
