import { describe, it, expect } from "vitest";
import {
  filterProjects,
  matchesQuery,
  normalize,
  pageWindow,
  paginate,
  statusCounts,
  PER_PAGE,
} from "~/utils/project-search";
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

describe("normalize", () => {
  it("strips Vietnamese tones", () => {
    expect(normalize("Chấm công")).toBe("cham cong");
    expect(normalize("Tỉnh Ninh Thuận")).toBe("tinh ninh thuan");
  });

  it("folds đ to d, which carries no combining mark", () => {
    expect(normalize("Đường")).toBe("duong");
    expect(normalize("dịch vụ")).toBe("dich vu");
  });

  it("lowercases and trims", () => {
    expect(normalize("  My PORTFOLIO ")).toBe("my portfolio");
  });

  it("leaves plain ASCII alone", () => {
    expect(normalize("BillSplitter")).toBe("billsplitter");
  });
});

describe("matchesQuery", () => {
  const p = project({
    name: "Chấm công & Tạo danh sách đơn",
    tagline: "Chấm công, tính lương",
    description: "Bảng chấm công theo buổi",
    url: "https://tdtu.huyab.click",
    tech: ["Cloudflare Pages", "JWT"],
    highlights: ["Tính lương"],
    since: "2026",
  });

  it("matches an empty query", () => {
    expect(matchesQuery(p, "")).toBe(true);
    expect(matchesQuery(p, "   ")).toBe(true);
  });

  it("matches text typed without tones", () => {
    expect(matchesQuery(p, "cham cong")).toBe(true);
    expect(matchesQuery(p, "tinh luong")).toBe(true);
  });

  it("matches text typed with tones", () => {
    expect(matchesQuery(p, "Chấm Công")).toBe(true);
  });

  it("matches the hostname", () => {
    expect(matchesQuery(p, "tdtu")).toBe(true);
  });

  it("matches a tech pill", () => {
    expect(matchesQuery(p, "jwt")).toBe(true);
  });

  it("matches the year", () => {
    expect(matchesQuery(p, "2026")).toBe(true);
  });

  it("requires every term but ignores their order", () => {
    expect(matchesQuery(p, "cong cham")).toBe(true);
    expect(matchesQuery(p, "cham nonsense")).toBe(false);
  });

  it("rejects a term that appears nowhere", () => {
    expect(matchesQuery(p, "jellyfin")).toBe(false);
  });
});

describe("filterProjects", () => {
  const list = [
    project({ id: "a", name: "Alpha", status: "live" }),
    project({ id: "b", name: "Beta", status: "wip" }),
    project({ id: "c", name: "Gamma", status: "archived" }),
  ];

  it("returns everything for an empty query and all statuses", () => {
    expect(filterProjects(list, "", "all")).toHaveLength(3);
  });

  it("filters by status", () => {
    expect(filterProjects(list, "", "live").map((p) => p.id)).toEqual(["a"]);
    expect(filterProjects(list, "", "archived").map((p) => p.id)).toEqual(["c"]);
  });

  it("combines query and status", () => {
    expect(filterProjects(list, "beta", "live")).toHaveLength(0);
    expect(filterProjects(list, "beta", "wip")).toHaveLength(1);
  });

  it("finds the real projects by a partial name", () => {
    // Guards the wiring against the shipped data, not just fixtures.
    const hits = filterProjects(PROJECTS, "chia keo", "all");
    expect(hits.map((p) => p.id)).toContain("chiakeo");
  });
});

describe("statusCounts", () => {
  it("counts each status plus a total", () => {
    const counts = statusCounts([
      project({ status: "live" }),
      project({ status: "live" }),
      project({ status: "wip" }),
    ]);
    expect(counts).toEqual({ all: 3, live: 2, wip: 1, archived: 0 });
  });

  it("returns zeroes for an empty list", () => {
    expect(statusCounts([])).toEqual({ all: 0, live: 0, wip: 0, archived: 0 });
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 16 }, (_, i) => i + 1);

  it("slices the first page", () => {
    const page = paginate(items, 1, 6);
    expect(page.items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(page).toMatchObject({ page: 1, totalPages: 3, total: 16, from: 1, to: 6 });
  });

  it("slices a middle page", () => {
    expect(paginate(items, 2, 6).items).toEqual([7, 8, 9, 10, 11, 12]);
  });

  it("returns a short last page", () => {
    const page = paginate(items, 3, 6);
    expect(page.items).toEqual([13, 14, 15, 16]);
    expect(page).toMatchObject({ from: 13, to: 16 });
  });

  it("clamps a page past the end to the last page", () => {
    // A stale ?page=9 in a shared link should not render an empty grid.
    expect(paginate(items, 9, 6).page).toBe(3);
    expect(paginate(items, 9, 6).items).toEqual([13, 14, 15, 16]);
  });

  it("clamps zero and negatives to the first page", () => {
    expect(paginate(items, 0, 6).page).toBe(1);
    expect(paginate(items, -4, 6).page).toBe(1);
  });

  it("handles NaN without producing an empty page", () => {
    expect(paginate(items, Number.NaN, 6).page).toBe(1);
  });

  it("reports one page and zero range for an empty list", () => {
    expect(paginate([], 1, 6)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      total: 0,
      from: 0,
      to: 0,
    });
  });

  it("defaults to PER_PAGE", () => {
    expect(paginate(items, 1).items).toHaveLength(PER_PAGE);
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("puts a gap after the first page when far from it", () => {
    expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
  });

  it("keeps the first pages contiguous near the start", () => {
    expect(pageWindow(2, 12)).toEqual([1, 2, 3, null, 12]);
  });

  it("keeps the last pages contiguous near the end", () => {
    expect(pageWindow(11, 12)).toEqual([1, null, 10, 11, 12]);
  });

  it("always includes the current, first and last page", () => {
    for (const current of [1, 5, 9, 20]) {
      const win = pageWindow(current, 20);
      expect(win).toContain(current);
      expect(win).toContain(1);
      expect(win).toContain(20);
    }
  });

  it("never repeats a page number", () => {
    const win = pageWindow(2, 20).filter((p): p is number => p !== null);
    expect(new Set(win).size).toBe(win.length);
  });
});
