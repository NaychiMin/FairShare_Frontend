import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type MessageHandler = (message: any) => void;

class WebSocketService {
  private stompClient: Client | null = null;
  private connected: boolean = false;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private userId: string | null = null;

  connect(userId: string): Promise<void> {
    if (this.connected && this.userId === userId) {
      return Promise.resolve();
    }

    this.userId = userId;
    const baseURL = import.meta.env.VITE_REACT_APP_FAIRSHARE_BACKEND_SERVICE_URL;

    return new Promise((resolve, reject) => {
      const socket = new SockJS(`${baseURL}/ws`);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log("[WebSocket]", str),
        onConnect: () => {
          console.log("WebSocket connected");
          this.connected = true;

          // Subscribe to user-specific badge notifications
          this.subscribeToTopic(`/topic/users/${userId}/badges`);

          resolve();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          reject(new Error(frame.headers["message"]));
        },
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        },
      });

      this.stompClient.activate();
    });
  }

  private subscribeToTopic(topic: string): void {
    if (!this.stompClient || !this.connected) return;

    this.stompClient.subscribe(topic, (message: IMessage) => {
      const body = JSON.parse(message.body);
      this.notifyHandlers(topic, body);
    });
  }

  on(topic: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }

    this.handlers.get(topic)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(topic);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(topic);
        }
      }
    };
  }

  private notifyHandlers(topic: string, data: any): void {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate();
      this.connected = false;
      this.userId = null;
      this.handlers.clear();
    }
  }
}

export default new WebSocketService();
