import type { Holiday } from "./domain/holiday";
import type { Note } from "./domain/note";
import type { Project } from "./domain/project";

export interface NoteStore {
  getNote(id: string): Promise<Note | null>;
  putNote(note: Note): Promise<void>;
  deleteNote(id: string): Promise<void>;
  getOwnerNoteIds(ownerId: string): Promise<string[]>;
  putOwnerNoteIds(ownerId: string, ids: string[]): Promise<void>;
}

export interface IdGenerator {
  next(): string;
}

export interface Clock {
  now(): string;
}

export type ProbeResult =
  | { ok: boolean; httpStatus: number; ms: number }
  | { error: string };

export interface SiteProbe {
  ping(url: string): Promise<ProbeResult>;
}

export interface ProjectCatalog {
  list(): Promise<Project[]>;
}

export interface HolidaySource {
  load(): Promise<Holiday[]>;
}

export interface CounterGateway {
  connect(request: Request): Promise<Response>;
}
