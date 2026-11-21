import type { AppLoadContext } from "react-router";
import { createD1ProjectCatalog } from "./adapters/d1/d1-project-catalog";
import { createDoCounterGateway } from "./adapters/durable-object/do-counter-gateway";
import { createCliHttp } from "./adapters/http/cli-http";
import { gamesRedirect } from "./adapters/http/games-redirect-http";
import {
  createHolidaysHttp,
  type HolidaysHttp,
} from "./adapters/http/holidays-http";
import { createNotesHttp, type NotesHttp } from "./adapters/http/notes-http";
import {
  createOnlineCounterHttp,
  type OnlineCounterHttp,
} from "./adapters/http/online-counter-http";
import {
  createProjectsHttp,
  type ProjectsHttp,
} from "./adapters/http/projects-http";
import { createKvNoteStore } from "./adapters/kv/kv-note-store";
import { createCsvHolidaySource } from "./adapters/static/csv-holiday-source";
import { systemClock } from "./adapters/system/system-clock";
import { uuidIds } from "./adapters/system/uuid-ids";
import { createFetchSiteProbe } from "./adapters/web/fetch-site-probe";
import { createCaseService } from "./core/application/case-service";
import { createHolidayService } from "./core/application/holiday-service";
import { createNoteService } from "./core/application/note-service";
import {
  createProjectService,
  type ProjectService,
} from "./core/application/project-service";

export function notesHttp(context: AppLoadContext | undefined): NotesHttp {
  const store = createKvNoteStore(context?.cloudflare?.env?.NOTES);
  return createNotesHttp(
    createNoteService({ store, ids: uuidIds, clock: systemClock }),
  );
}

export function projectService(context: AppLoadContext): ProjectService {
  return createProjectService({
    catalog: createD1ProjectCatalog(context.cloudflare.env.DB),
    probe: createFetchSiteProbe(),
    clock: systemClock,
  });
}

export function projectsHttp(context: AppLoadContext): ProjectsHttp {
  return createProjectsHttp(projectService(context));
}

export function holidaysHttp(): HolidaysHttp {
  return createHolidaysHttp(
    createHolidayService({ source: createCsvHolidaySource() }),
  );
}

export function onlineCounterHttp(context: AppLoadContext): OnlineCounterHttp {
  return createOnlineCounterHttp(
    createDoCounterGateway(context.cloudflare.env.ONLINE_COUNTER),
  );
}

export function edgeHandlers() {
  const cli = createCliHttp(createCaseService());
  return { gamesRedirect, cli: cli.handle };
}
