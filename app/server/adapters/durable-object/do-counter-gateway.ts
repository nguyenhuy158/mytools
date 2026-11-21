import type { CounterGateway } from "../../core/ports";

const GLOBAL_COUNTER = "global";

export interface CounterNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): { fetch(request: Request): Promise<Response> };
}

export function createDoCounterGateway(
  namespace: CounterNamespace,
): CounterGateway {
  return {
    connect(request) {
      // Use a single named Durable Object instance for global user count
      const stub = namespace.get(namespace.idFromName(GLOBAL_COUNTER));
      // Forward the WebSocket upgrade request to the Durable Object
      return stub.fetch(request);
    },
  };
}
