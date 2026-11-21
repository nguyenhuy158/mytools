import type { CounterGateway } from "../../core/ports";

export function createOnlineCounterHttp(gateway: CounterGateway) {
  async function connect(request: Request): Promise<Response> {
    try {
      return await gateway.connect(request);
    } catch {
      return new Response("Failed to connect to online counter", {
        status: 500,
      });
    }
  }

  return { connect };
}

export type OnlineCounterHttp = ReturnType<typeof createOnlineCounterHttp>;
