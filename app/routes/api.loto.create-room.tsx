import type { Route } from "./+types/api.loto.create-room";

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;

  try {
    // Generate a random room ID
    const roomId = crypto.randomUUID();

    // Get the Durable Object stub
    const id = env.LOTO_ROOMS.idFromName(roomId);
    const stub = env.LOTO_ROOMS.get(id);

    // Return room information
    return Response.json({
      success: true,
      roomId,
      wsUrl: `/api/loto/room/${roomId}/ws`
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create room'
    }, { status: 500 });
  }
}
