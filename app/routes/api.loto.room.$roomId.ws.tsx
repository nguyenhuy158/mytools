import type { Route } from "./+types/api.loto.room.$roomId.ws";

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const { roomId } = params;

  try {
    // Get the Durable Object stub
    const id = env.LOTO_ROOMS.idFromName(roomId);
    const stub = env.LOTO_ROOMS.get(id);

    // Forward the WebSocket upgrade request to the Durable Object
    return stub.fetch(request);
  } catch (error) {
    return new Response('Failed to connect to room', { status: 500 });
  }
}
