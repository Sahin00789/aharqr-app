import { useEffect, useRef, useState } from 'react';

export interface WebhookRoomEvent {
  event: string;
  roomId?: string;
  message?: string;
  data?: any;
  timestamp?: string;
  activeClientsInRoom?: number;
}

export function useWebhookRoom(roomId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebhookRoomEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const urlIndexRef = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    let isUnmounted = false;

    // Construct candidate WebSocket URLs
    const getCandidateUrls = (): string[] => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const host = window.location.host;

      const envWsUrl = import.meta.env.VITE_WS_URL;
      const candidates: string[] = [];

      if (envWsUrl) {
        candidates.push(`${envWsUrl.replace(/\/$/, '')}/ws/webhook-room/${roomId}`);
      }

      // Priority 1: Direct backend port 3000 on current hostname (e.g. ws://192.168.1.x:3000 or ws://localhost:3000)
      candidates.push(`${protocol}//${hostname}:3000/ws/webhook-room/${roomId}`);

      // Priority 2: Proxied Vite path (e.g. ws://localhost:5173/ws/...)
      candidates.push(`${protocol}//${host}/ws/webhook-room/${roomId}`);

      return candidates;
    };

    const candidateUrls = getCandidateUrls();

    const connect = () => {
      if (isUnmounted) return;

      const wsUrl = candidateUrls[urlIndexRef.current % candidateUrls.length];
      console.log(`📡 [Frontend WebSocket] Connecting to Webhook Room [${roomId}] at ${wsUrl}...`);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          console.log(`🚀 [Frontend WebSocket] CONNECTED to Webhook Room [${roomId}]!`);

          // Start Heartbeat PING interval every 15s
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
            if (parsed.event !== 'PONG') {
              setLastEvent(parsed);
            }
          } catch (err) {
            console.log(`📩 [Frontend WebSocket] Message received:`, event.data);
          }
        };

        ws.onerror = (error) => {
          console.error(`⚠️ [Frontend WebSocket] Connection error in Room [${roomId}] (${wsUrl}):`, error);
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

          // Cycle to next candidate URL on failure
          urlIndexRef.current += 1;
          console.warn(`🔌 [Frontend WebSocket] Disconnected from Room [${roomId}]. Retrying in 2s...`);

          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 2000);
        };
      } catch (err) {
        console.error(`❌ [Frontend WebSocket] Connection attempt failed:`, err);
        if (!isUnmounted) {
          urlIndexRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 2000);
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
  }, [roomId]);

  return { isConnected, lastEvent };
}
