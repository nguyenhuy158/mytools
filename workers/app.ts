import { createRequestHandler } from "react-router";
import { handleCliRequest } from "./cli";

// Export Durable Object classes
export { LotoGameRoom } from "./loto-room";
export { OnlineCounter } from "./online-counter";

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
    // Terminal clients (curl/wget) get plain text; returns null for everything
    // else so the app, /api routes and WebSocket upgrades are unaffected.
    const cliResponse = await handleCliRequest(request);
    if (cliResponse) return cliResponse;

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
