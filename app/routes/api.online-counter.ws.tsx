import type { Route } from "./+types/api.online-counter.ws";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;

  try {
    // Use a single named Durable Object instance for global user count
    const id = env.ONLINE_COUNTER.idFromName("global");
    const stub = env.ONLINE_COUNTER.get(id);

    // Forward the WebSocket upgrade request to the Durable Object
    return stub.fetch(request);
  } catch (error) {
    return new Response("Failed to connect to online counter", { status: 500 });
  }
}
