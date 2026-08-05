import { DurableObject } from "cloudflare:workers";

export class OnlineCounter extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // acceptWebSocket registers the socket with the DO runtime itself, so
    // ctx.getWebSockets() below stays correct across hibernation — a private
    // Set field would not: it gets wiped whenever the DO hibernates and the
    // constructor reruns, and there is no webSocketOpen hook in the
    // Hibernatable WebSocket API to repopulate it on wake.
    this.ctx.acceptWebSocket(server);
    this.broadcastCount();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data = JSON.parse(message as string);
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch {
      // Ignore invalid messages
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.broadcastCount();
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    this.broadcastCount();
  }

  private broadcastCount(): void {
    const sockets = this.ctx.getWebSockets();
    const message = JSON.stringify({ type: "count", count: sockets.length });

    for (const ws of sockets) {
      try {
        ws.send(message);
      } catch {
        // A dead socket will be cleaned up by webSocketClose/Error.
      }
    }
  }
}
