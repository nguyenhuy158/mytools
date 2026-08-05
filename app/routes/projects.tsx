import { ArrowUpRight, Clock, Globe, Layers, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/PageHeader";
import { PROJECTS, type Project } from "../data/projects";
import {
  displayHost,
  initials,
  latencyBand,
  sortForDisplay,
  type ProjectStatus,
  type StatusSummary,
} from "../utils/project-stats";
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

interface StatusPayload {
  checkedAt: string;
  summary: StatusSummary;
  statuses: ProjectStatus[];
}

export default function Projects() {
  const { t } = useTranslation();
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

  const projects = sortForDisplay(PROJECTS);
  const byId = new Map((data?.statuses ?? []).map((s) => [s.id, s]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <PageHeader
        title={t("projects.title")}
        description={t("projects.description")}
      />

      <StatRow
        summary={data?.summary}
        checkedAt={data?.checkedAt}
        failed={failed}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            status={byId.get(project.id)}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {t("projects.empty")}
        </p>
      )}
    </div>
  );
}

function StatRow({
  summary,
  checkedAt,
  failed,
}: {
  summary?: StatusSummary;
  checkedAt?: string;
  failed: boolean;
}) {
  const { t, i18n } = useTranslation();

  const stats = [
    {
      icon: Layers,
      value: String(summary?.total ?? PROJECTS.length),
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

  if (!status || status.online === null) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        {t("projects.checking_short")}
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
