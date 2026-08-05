import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Layers,
  Radio,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useLoaderData } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { loadProjects, type Project } from "../data/projects";
import {
  displayHost,
  initials,
  latencyBand,
  sortForDisplay,
  type ProjectStatus,
  type StatusSummary,
} from "../utils/project-stats";
import {
  filterProjects,
  pageWindow,
  paginate,
  statusCounts,
  type StatusFilter,
} from "../utils/project-search";
import type { Route } from "./+types/projects";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projects — ToolHub" },
    {
      name: "description",
      content: "Các sản phẩm web đang làm, kèm trạng thái hoạt động thực tế.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const projects = await loadProjects(env.DB);
  return { projects };
}

interface StatusPayload {
  checkedAt: string;
  summary: StatusSummary;
  statuses: ProjectStatus[];
}

export default function Projects() {
  const { t } = useTranslation();
  const { projects } = useLoaderData<typeof loader>();
  // Checked client-side so the page paints immediately instead of waiting on
  // every third-party site to answer.
  const [data, setData] = useState<StatusPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects-status")
      .then((r) =>
        r.ok
          ? (r.json() as Promise<StatusPayload>)
          : Promise.reject(new Error("bad status")),
      )
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Search, filter and page live in the URL, so a filtered view can be shared
  // and the back button steps through it.
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const statusFilter = (
    ["all", "live", "wip", "archived"].includes(status) ? status : "all"
  ) as StatusFilter;

  const sorted = useMemo(() => sortForDisplay(projects), [projects]);
  const counts = useMemo(() => statusCounts(sorted), [sorted]);
  const matched = useMemo(
    () => filterProjects(sorted, query, statusFilter),
    [sorted, query, statusFilter],
  );
  const current = paginate(matched, page);

  const byId = new Map((data?.statuses ?? []).map((s) => [s.id, s]));

  /** Any change to the result set sends the reader back to page one. */
  const applyQuery = (value: string) => {
    setQuery(value || null);
    setPage(null);
  };
  const applyStatus = (value: StatusFilter) => {
    setStatus(value === "all" ? null : value);
    setPage(null);
  };
  const goToPage = (value: number) => {
    setPage(value === 1 ? null : value);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filtering = query.trim() !== "" || statusFilter !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <PageHeader
        title={t("projects.title")}
        description={t("projects.description")}
      />

      <StatRow
        summary={data?.summary}
        checkedAt={data?.checkedAt}
        failed={failed}
        total={projects.length}
      />

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={applyQuery} />
          <StatusChips
            value={statusFilter}
            counts={counts}
            onChange={applyStatus}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {current.total === 0
              ? t("projects.results_none")
              : t("projects.results_range", {
                  from: current.from,
                  to: current.to,
                  total: current.total,
                })}
          </span>
          {filtering && (
            <button
              onClick={() => {
                applyQuery("");
                applyStatus("all");
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("projects.clear_filters")}
            </button>
          )}
        </div>
      </div>

      {current.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {current.items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              status={byId.get(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-500 dark:text-gray-400">
            {filtering
              ? t("projects.no_match", { query: query.trim() })
              : t("projects.empty")}
          </p>
          {filtering && (
            <button
              onClick={() => {
                applyQuery("");
                applyStatus("all");
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("projects.clear_filters")}
            </button>
          )}
        </div>
      )}

      <Pagination
        page={current.page}
        totalPages={current.totalPages}
        onGo={goToPage}
      />
    </div>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative flex-1 lg:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("projects.search_placeholder")}
        aria-label={t("projects.search_placeholder")}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label={t("projects.clear_search")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function StatusChips({
  value,
  counts,
  onChange,
}: {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (value: StatusFilter) => void;
}) {
  const { t } = useTranslation();
  const chips: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("projects.filter.all") },
    { key: "live", label: t("projects.state.online") },
    { key: "wip", label: t("projects.state.wip") },
    { key: "archived", label: t("projects.state.archived") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ key, label }) => {
        const active = value === key;
        // A filter that would show nothing is not worth offering.
        const empty = counts[key] === 0 && key !== "all";
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            disabled={empty}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              active
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400"
            } ${empty ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {label}
            <span
              className={`ml-1.5 tabular-nums ${active ? "text-blue-100" : "text-gray-400"}`}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onGo,
}: {
  page: number;
  totalPages: number;
  onGo: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const buttonClass =
    "min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-lg text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav
      aria-label={t("projects.pagination")}
      className="flex items-center justify-center gap-1.5 pt-2"
    >
      <button
        onClick={() => onGo(page - 1)}
        disabled={page === 1}
        aria-label={t("projects.prev_page")}
        className={`${buttonClass} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onGo(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${buttonClass} tabular-nums ${
              p === page
                ? "bg-blue-600 border-blue-600 text-white font-semibold"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onGo(page + 1)}
        disabled={page === totalPages}
        aria-label={t("projects.next_page")}
        className={`${buttonClass} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function StatRow({
  summary,
  checkedAt,
  failed,
  total,
}: {
  summary?: StatusSummary;
  checkedAt?: string;
  failed: boolean;
  total: number;
}) {
  const { t, i18n } = useTranslation();

  const stats = [
    {
      icon: Layers,
      value: String(summary?.total ?? total),
      label: t("projects.stats.projects"),
    },
    {
      icon: Radio,
      value: summary ? `${summary.online}/${summary.checked}` : "—",
      label: t("projects.stats.online"),
    },
    {
      icon: Clock,
      value: summary?.medianMs != null ? `${summary.medianMs} ms` : "—",
      label: t("projects.stats.median"),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center"
          >
            <Icon className="w-5 h-5 mx-auto mb-2 text-gray-400" />
            <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
              {value}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        {failed
          ? t("projects.check_failed")
          : checkedAt
            ? t("projects.checked_at", {
                time: new Date(checkedAt).toLocaleTimeString(i18n.language),
              })
            : t("projects.checking")}
      </p>
    </div>
  );
}

function ProjectCard({
  project,
  status,
}: {
  project: Project;
  status?: ProjectStatus;
}) {
  const { t } = useTranslation();

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
    >
      <Preview project={project} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
              <Globe className="w-3 h-3 shrink-0" />
              {displayHost(project.url)}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-500 transition-colors" />
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {project.tagline}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
          {project.description}
        </p>

        {project.highlights && project.highlights.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {project.highlights.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <StatusDot status={status} projectStatus={project.status} />
          {project.since && (
            <span className="text-xs text-gray-400">
              {t("projects.since", { year: project.since })}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/**
 * Screenshot when there is one, otherwise a gradient tile with the initials.
 * The tile also covers a missing or renamed image file, so a broken snapshot
 * never leaves a blank hole in the card.
 */
function Preview({ project }: { project: Project }) {
  const [imageBroken, setImageBroken] = useState(false);
  const showImage = project.image && !imageBroken;

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
      {showImage ? (
        <img
          src={project.image}
          alt={`Ảnh chụp ${project.name}`}
          loading="lazy"
          width={1200}
          height={750}
          onError={() => setImageBroken(true)}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${project.accent} flex items-center justify-center`}
        >
          <span className="text-4xl font-black text-white/90 tracking-tight">
            {initials(project.name)}
          </span>
        </div>
      )}
    </div>
  );
}

function StatusDot({
  status,
  projectStatus,
}: {
  status?: ProjectStatus;
  projectStatus: Project["status"];
}) {
  const { t } = useTranslation();

  if (projectStatus !== "live") {
    const label =
      projectStatus === "wip" ? t("projects.state.wip") : t("projects.state.archived");
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        {label}
      </span>
    );
  }

  // No result yet: the check is still in flight.
  if (!status) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        {t("projects.checking_short")}
      </span>
    );
  }

  // A result that says nothing — skipped, or a same-zone loopback that cannot
  // be trusted. Saying "checking" forever would be a lie.
  if (status.online === null) {
    return (
      <span
        className="text-xs text-gray-400 flex items-center gap-1.5"
        title={status.error ?? undefined}
      >
        <span className="w-2 h-2 rounded-full bg-gray-300" />
        {t("projects.state.unknown")}
      </span>
    );
  }

  if (!status.online) {
    return (
      <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        {t("projects.state.offline")}
        {status.httpStatus ? ` (${status.httpStatus})` : ""}
      </span>
    );
  }

  const band = latencyBand(status.ms);
  const msColor =
    band === "fast"
      ? "text-emerald-600 dark:text-emerald-400"
      : band === "ok"
        ? "text-amber-600 dark:text-amber-400"
        : "text-orange-600 dark:text-orange-400";

  return (
    <span className="text-xs flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span className="text-emerald-600 dark:text-emerald-400">
        {t("projects.state.online")}
      </span>
      {status.ms != null && (
        <span className={`tabular-nums ${msColor}`}>{status.ms} ms</span>
      )}
    </span>
  );
}
