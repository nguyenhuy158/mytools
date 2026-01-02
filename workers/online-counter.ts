import { DurableObject } from "cloudflare:workers";

interface CounterState {
  userCount: number;
}

export class OnlineCounter extends DurableObject {
  private sessions: Set<WebSocket>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Optional: handle ping/pong or other messages
    try {
      const data = JSON.parse(message as string);
      if (data.type === "ping") {
        this.sendToWebSocket(ws, { type: "pong" });
      }
    } catch {
      // Ignore invalid messages
    }
  }

  async webSocketOpen(ws: WebSocket): Promise<void> {
    this.sessions.add(ws);
    this.broadcastCount();
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.sessions.delete(ws);
    this.broadcastCount();
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    this.sessions.delete(ws);
    this.broadcastCount();
  }

  private broadcastCount(): void {
    const count = this.sessions.size;
    const message = JSON.stringify({ type: "count", count });

    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch (error) {
        // Remove failed sessions
        this.sessions.delete(session);
      }
    }
  }

  private sendToWebSocket(ws: WebSocket, data: any): void {
    try {
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }
}
