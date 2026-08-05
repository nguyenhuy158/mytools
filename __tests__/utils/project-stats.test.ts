import { describe, it, expect } from "vitest";
import {
  displayHost,
  initials,
  latencyBand,
  sortForDisplay,
  summarize,
  type ProjectStatus,
} from "~/utils/project-stats";
import { PROJECTS, type Project } from "~/data/projects";

const project = (over: Partial<Project> = {}): Project => ({
  id: "x",
  name: "X",
  url: "https://x.com",
  tagline: "t",
  description: "d",
  tech: [],
  accent: "from-blue-500 to-indigo-600",
  status: "live",
  ...over,
});

describe("Project stats", () => {
  describe("summarize", () => {
    it("counts online and offline sites", () => {
      const statuses: ProjectStatus[] = [
        { id: "a", online: true, ms: 100 },
        { id: "b", online: true, ms: 200 },
        { id: "c", online: false, ms: null },
      ];
      expect(summarize(statuses)).toEqual({
        total: 3,
        checked: 3,
        online: 2,
        offline: 1,
        medianMs: 150,
      });
    });

    it("excludes skipped checks from the checked count", () => {
      const summary = summarize([
        { id: "a", online: true, ms: 100 },
        { id: "b", online: null, ms: null },
      ]);
      expect(summary.total).toBe(2);
      expect(summary.checked).toBe(1);
      expect(summary.offline).toBe(0);
    });

    it("takes the median, so one slow site does not skew it", () => {
      const summary = summarize([
        { id: "a", online: true, ms: 100 },
        { id: "b", online: true, ms: 120 },
        { id: "c", online: true, ms: 9000 },
      ]);
      expect(summary.medianMs).toBe(120);
    });

    it("returns a null median when nothing was timed", () => {
      expect(summarize([{ id: "a", online: false, ms: null }]).medianMs).toBe(
        null,
      );
      expect(summarize([]).medianMs).toBe(null);
    });

    it("handles an empty list", () => {
      expect(summarize([])).toEqual({
        total: 0,
        checked: 0,
        online: 0,
        offline: 0,
        medianMs: null,
      });
    });
  });

  describe("displayHost", () => {
    it("strips the scheme, path and www", () => {
      expect(displayHost("https://www.example.com/a/b?c=1")).toBe(
        "example.com",
      );
      expect(displayHost("https://huyab.click")).toBe("huyab.click");
    });

    it("returns the input unchanged when it is not a URL", () => {
      expect(displayHost("not a url")).toBe("not a url");
    });
  });

  describe("initials", () => {
    it("uses the first letter of the first two words", () => {
      expect(initials("Tool Hub")).toBe("TH");
      expect(initials("ToolHub")).toBe("T");
      expect(initials("a-b")).toBe("AB");
    });

    it("handles Vietnamese names", () => {
      expect(initials("đường phố")).toBe("ĐP");
    });

    it("does not crash on an empty name", () => {
      expect(initials("")).toBe("?");
      expect(initials("   ")).toBe("?");
    });
  });

  describe("latencyBand", () => {
    it("buckets by speed", () => {
      expect(latencyBand(100)).toBe("fast");
      expect(latencyBand(500)).toBe("ok");
      expect(latencyBand(2000)).toBe("slow");
    });

    it("returns null when unknown", () => {
      expect(latencyBand(null)).toBe(null);
    });
  });

  describe("sortForDisplay", () => {
    it("puts live first, then wip, then archived", () => {
      const sorted = sortForDisplay([
        project({ id: "old", name: "Old", status: "archived" }),
        project({ id: "wip", name: "Wip", status: "wip" }),
        project({ id: "live", name: "Live", status: "live" }),
      ]);
      expect(sorted.map((p) => p.id)).toEqual(["live", "wip", "old"]);
    });

    it("orders newest first within a status", () => {
      const sorted = sortForDisplay([
        project({ id: "a", name: "A", since: "2024" }),
        project({ id: "b", name: "B", since: "2026" }),
      ]);
      expect(sorted.map((p) => p.id)).toEqual(["b", "a"]);
    });

    it("does not mutate the input array", () => {
      const input = [
        project({ id: "z", status: "archived" }),
        project({ id: "a", status: "live" }),
      ];
      sortForDisplay(input);
      expect(input.map((p) => p.id)).toEqual(["z", "a"]);
    });
  });

  describe("PROJECTS data", () => {
    it("has unique ids", () => {
      const ids = PROJECTS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses absolute https URLs, since they get fetched", () => {
      for (const p of PROJECTS) {
        expect(() => new URL(p.url), `${p.id} has a bad url`).not.toThrow();
        expect(p.url.startsWith("https://"), `${p.id} is not https`).toBe(true);
      }
    });

    it("fills in the fields the card renders", () => {
      for (const p of PROJECTS) {
        expect(p.name, `${p.id} name`).toBeTruthy();
        expect(p.tagline, `${p.id} tagline`).toBeTruthy();
        expect(p.description, `${p.id} description`).toBeTruthy();
        expect(p.accent, `${p.id} accent`).toContain("from-");
      }
    });
  });
});
