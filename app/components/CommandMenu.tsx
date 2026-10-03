import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    useMatches,
    KBarResults,
    useKBar,
    type Action,
} from "kbar";
import { useNavigate } from "react-router";
import {
    Home,
    Info,
    Terminal,
    FileJson,
    FileDiff,
    Gamepad2,
    Grid3X3,
    Bomb,
    Ghost,
    Coffee,
    Calendar,
    Quote,
    Timer,
    Search,
    Sun,
    Moon,
    Languages,
    Settings,
    Activity,
    LayoutGrid,
    Ticket,
    Hash,
    Lightbulb,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { toast } from "sonner";
import { useTheme } from "../utils/theme";
import { GAMES_URL, GAME_PATHS } from "../utils/games";

export function CommandMenu({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [theme, updateTheme] = useTheme();

    const actions: Action[] = useMemo(() => [
        // Navigation
        {
            id: "home",
            name: t("nav.home"),
            shortcut: ["h"],
            keywords: "home dashboard index",
            perform: () => navigate("/"),
            icon: <Home className="w-4 h-4" />,
            section: t("nav.features"),
        },
        {
            id: "about",
            name: t("nav.about"),
            shortcut: ["a"],
            keywords: "about info help",
            perform: () => navigate("/about"),
            icon: <Info className="w-4 h-4" />,
            section: t("nav.features"),
        },
        // IT Tools
        {
            id: "it",
            name: t("nav.it_tools"),
            keywords: "it developer tools dev",
            perform: () => navigate("/it"),
            icon: <Terminal className="w-4 h-4" />,
            section: t("nav.it_tools"),
        },
        {
            id: "json-tools",
            name: t("nav.json_tools"),
            parent: "it",
            keywords: "json format validate minify",
            perform: () => navigate("/it/json-tools"),
            icon: <FileJson className="w-4 h-4" />,
        },
        {
            id: "text-diff",
            name: t("nav.text_diff"),
            parent: "it",
            keywords: "diff compare text",
            perform: () => navigate("/it/text-diff"),
            icon: <FileDiff className="w-4 h-4" />,
        },
        {
            id: "number-reading",
            name: t("nav.number_reading"),
            parent: "it",
            keywords: "number read text",
            perform: () => navigate("/it/number-reading"),
            icon: <Hash className="w-4 h-4" />,
        },
        // Games
        {
            id: "games",
            name: t("nav.games"),
            keywords: "games play fun",
            perform: () => window.location.assign(GAMES_URL),
            icon: <Gamepad2 className="w-4 h-4" />,
            section: t("nav.games"),
        },
        ...[
            { id: "2048", name: "2048", keywords: "2048 puzzle number", icon: Grid3X3 },
            { id: "sudoku", name: "Sudoku", keywords: "sudoku puzzle number", icon: Grid3X3 },
            { id: "minesweeper", name: "Minesweeper", keywords: "minesweeper bomb mine do min", icon: Bomb },
            { id: "snake", name: "Snake", keywords: "snake classic nokia game", icon: Activity },
            { id: "tetris", name: "Tetris", keywords: "tetris block game", icon: LayoutGrid },
            { id: "loto", name: "Lô tô", keywords: "loto lo to bingo multiplayer", icon: Ticket },
        ].map(({ id, name, keywords, icon: Icon }) => ({
            id,
            name,
            parent: "games",
            keywords,
            perform: () => window.location.assign(`${GAMES_URL}${GAME_PATHS[id]}`),
            icon: <Icon className="w-4 h-4" />,
        })),
        // Lifestyle
        {
            id: "lifestyle",
            name: t("nav.lifestyle"),
            keywords: "lifestyle productivity tools",
            perform: () => navigate("/lifestyle"),
            icon: <Coffee className="w-4 h-4" />,
            section: t("nav.lifestyle"),
        },
        {
            id: "pomodoro",
            name: t("nav.pomodoro"),
            parent: "lifestyle",
            keywords: "pomodoro timer focus work",
            perform: () => navigate("/lifestyle/pomodoro"),
            icon: <Timer className="w-4 h-4" />,
        },
        {
            id: "calendar",
            name: t("nav.calendar"),
            parent: "lifestyle",
            keywords: "calendar date event",
            perform: () => navigate("/calendar"),
            icon: <Calendar className="w-4 h-4" />,
        },
        {
            id: "quotes",
            name: t("nav.quotes"),
            parent: "lifestyle",
            keywords: "quotes motivation daily",
            perform: () => navigate("/lifestyle/quotes"),
            icon: <Lightbulb className="w-4 h-4" />,
        },
        // Settings / Customization
        {
            id: "settings",
            name: t("nav.settings"),
            keywords: "settings theme language config",
            icon: <Settings className="w-4 h-4" />,
            section: t("nav.system"),
        },
        {
            id: "theme",
            name: "Theme",
            parent: "settings",
            keywords: "dark light mode theme",
            icon: theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
        },
        {
            id: "theme-light",
            name: "Light Mode",
            parent: "theme",
            perform: () => updateTheme("light"),
            icon: <Sun className="w-4 h-4" />,
        },
        {
            id: "theme-dark",
            name: "Dark Mode",
            parent: "theme",
            perform: () => updateTheme("dark"),
            icon: <Moon className="w-4 h-4" />,
        },
        {
            id: "language",
            name: t("nav.language"),
            parent: "settings",
            keywords: "language lang translate vi en",
            icon: <Languages className="w-4 h-4" />,
        },
        {
            id: "lang-en",
            name: "English (US)",
            parent: "language",
            perform: () => {
                i18n.changeLanguage("en");
                toast.success(t("nav.toast.language_changed"));
            },
            icon: <span className="text-xs">🇺🇸</span>,
        },
        {
            id: "lang-vi",
            name: "Tiếng Việt",
            parent: "language",
            perform: () => {
                i18n.changeLanguage("vi");
                toast.success(t("nav.toast.language_changed"));
            },
            icon: <span className="text-xs">🇻🇳</span>,
        },
    ], [navigate, t, i18n, theme]);

    return (
        <KBarProvider actions={actions}>
            <KBarPortal>
                <KBarPositioner className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-start justify-center pt-[15vh]">
                    <KBarAnimator className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden transform transition-all">
                        <div className="flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800">
                            <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                            <div className="flex-1 flex items-center overflow-hidden">
                                <Breadcrumbs />
                                <KBarSearch className="flex-1 py-4 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-lg" />
                            </div>
                            <div className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 font-medium shrink-0">
                                ESC
                            </div>
                        </div>
                        <RenderResults />
                        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] text-zinc-400 flex justify-between items-center shrink-0">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">↑↓</kbd> {t("nav.kbd_navigate")}</span>
                                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">↵</kbd> {t("nav.kbd_open")}</span>
                            </div>
                            <div className="hidden sm:block font-medium">
                                ToolHub Command Palette
                            </div>
                        </div>
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </KBarProvider>
    );
}

function Breadcrumbs() {
    const { query, currentRootActionId, actions } = useKBar((state) => ({
        currentRootActionId: state.currentRootActionId,
        actions: state.actions,
    }));

    if (!currentRootActionId) return null;

    const action = actions[currentRootActionId];
    if (!action) return null;

    return (
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <button
                onClick={() => query.setCurrentRootAction(undefined)}
                className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
                {action.icon && <span className="w-3.5 h-3.5">{action.icon}</span>}
                {action.name}
            </button>
            <span className="text-zinc-400 text-sm">/</span>
        </div>
    );
}

function RenderResults() {
    const { results } = useMatches();
    const { t } = useTranslation();
    const { search } = useKBar((state) => ({
        search: state.searchQuery,
    }));

    if (results.length === 0 && search) {
        return (
            <div className="px-4 py-12 text-center text-zinc-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-zinc-300 dark:text-zinc-700 opacity-50" />
                <p>{t("nav.no_results")} <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{search}"</span></p>
            </div>
        );
    }

    return (
        <div className="max-h-[60vh] overflow-y-auto py-2">
            <KBarResults
                items={results}
                onRender={({ item, active }) =>
                    typeof item === "string" ? (
                        <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            {item}
                        </div>
                    ) : (
                        <div
                            className={`px-4 py-4 flex items-center justify-between cursor-pointer transition-all ${active
                                ? "bg-zinc-100 dark:bg-zinc-800 border-l-4 border-black dark:border-white pl-3"
                                : "border-l-4 border-transparent ml-0"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon && (
                                    <span
                                        className={`${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                )}
                                <div className="flex flex-col">
                                    <span
                                        className={`font-medium ${active
                                            ? "text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-700 dark:text-zinc-300"
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                    {item.subtitle && (
                                        <span className="text-xs text-zinc-500">{item.subtitle}</span>
                                    )}
                                </div>
                            </div>
                            {item.shortcut?.length ? (
                                <div className="flex gap-1">
                                    {item.shortcut.map((sc) => (
                                        <kbd
                                            key={sc}
                                            className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 font-mono shadow-sm"
                                        >
                                            {sc}
                                        </kbd>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )
                }
            />
        </div>
    );
}
