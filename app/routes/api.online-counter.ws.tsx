import { onlineCounterHttp } from "~/server/compose";
import type { Route } from "./+types/api.online-counter.ws";

export async function loader({ request, context }: Route.LoaderArgs) {
  return onlineCounterHttp(context).connect(request);
}
