import { createRequestHandler } from "react-router";
import { edgeHandlers } from "../app/server/compose";

// Cloudflare needs the Durable Object class exported from the entry file.
export { OnlineCounter } from "../app/server/adapters/durable-object/online-counter";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const edge = edgeHandlers();

    const redirect = edge.gamesRedirect(request);
    if (redirect) return redirect;

    // Terminal clients (curl/wget) get plain text; returns null for everything
    // else so the app, /api routes and WebSocket upgrades are unaffected.
    const cliResponse = await edge.cli(request);
    if (cliResponse) return cliResponse;

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
