import { useEffect, useRef, useState } from 'react';

export interface WebhookRoomEvent {
  event: string;
  roomId?: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

export function useWebhookRoom(roomId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebhookRoomEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use window.location.host so Vite dev proxy routes /ws seamlessly to Fastify
      const wsUrl = `${protocol}//${window.location.host}/ws/webhook-room/${roomId}`;

      console.log(`📡 [Frontend WebSocket] Connecting to Webhook Room [${roomId}] at ${wsUrl}...`);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          console.log(`🚀 [Frontend WebSocket] CONNECTED to Webhook Room [${roomId}]!`);
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const parsed: WebhookRoomEvent = JSON.parse(event.data);
            setLastEvent(parsed);
          } catch (err) {
            console.log(`📩 [Frontend WebSocket] Message received:`, event.data);
          }
        };

        ws.onerror = (error) => {
          console.error(`⚠️ [Frontend WebSocket] Error in Room [${roomId}]:`, error);
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          console.warn(`🔌 [Frontend WebSocket] Disconnected from Room [${roomId}]. Retrying in 3s...`);
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (err) {
        console.error(`❌ [Frontend WebSocket] Connection attempt failed:`, err);
        if (!isUnmounted) {
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  return { isConnected, lastEvent };
}
