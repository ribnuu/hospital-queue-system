import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * useQueueSocket - subscribes to live queue updates and AI alerts via WebSocket/STOMP
 * @param {string} department  - department to subscribe to (null = skip dept channel)
 * @param {function} onUpdate  - callback when queue changes
 * @param {function} onAlert   - callback when AI alert arrives
 */
export function useQueueSocket(department, onUpdate, onAlert) {
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to department queue channel
        if (department) {
          client.subscribe(`/topic/queue/${department}`, msg => {
            onUpdate && onUpdate(JSON.parse(msg.body));
          });
        }
        // Subscribe to personal AI alerts
        client.subscribe('/user/queue/alerts', msg => {
          onAlert && onAlert(JSON.parse(msg.body));
        });
      },
    });
    client.activate();
    clientRef.current = client;
  }, [department, onUpdate, onAlert]);

  useEffect(() => {
    connect();
    return () => clientRef.current?.deactivate();
  }, [connect]);
}
