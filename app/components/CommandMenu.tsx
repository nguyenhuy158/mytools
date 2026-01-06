import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    useMatches,
    KBarResults,
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
    Hash,
    Lightbulb,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

export function CommandMenu({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        const currentTheme = savedTheme || systemTheme;
        setTheme(currentTheme);
    }, []);

    const updateTheme = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
            toast.success(t("nav.toast.dark_mode"));
        } else {
            document.documentElement.classList.remove("dark");
            toast.success(t("nav.toast.light_mode"));
        }
    };

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
            perform: () => navigate("/games"),
            icon: <Gamepad2 className="w-4 h-4" />,
            section: t("nav.games"),
        },
        {
            id: "2048",
            name: "2048",
            parent: "games",
            keywords: "2048 puzzle number",
            perform: () => navigate("/games/2048"),
            icon: <Grid3X3 className="w-4 h-4" />,
        },
        {
            id: "sudoku",
            name: "Sudoku",
            parent: "games",
            keywords: "sudoku puzzle number",
            perform: () => navigate("/games/sudoku"),
            icon: <Grid3X3 className="w-4 h-4" />,
        },
        {
            id: "minesweeper",
            name: "Minesweeper",
            parent: "games",
            keywords: "minesweeper bomb mine",
            perform: () => navigate("/games/minesweeper"),
            icon: <Bomb className="w-4 h-4" />,
        },
        {
            id: "snake",
            name: "Snake",
            parent: "games",
            keywords: "snake classic game",
            perform: () => navigate("/games/snake"),
            icon: <Activity className="w-4 h-4" />,
        },
        {
            id: "tetris",
            name: "Tetris",
            parent: "games",
            keywords: "tetris block game",
            perform: () => navigate("/games/tetris"),
            icon: <LayoutGrid className="w-4 h-4" />,
        },
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
                            <Search className="w-5 h-5 text-zinc-400 mr-3" />
                            <KBarSearch className="flex-1 py-4 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-lg" />
                            <div className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 font-medium">
                                ESC
                            </div>
                        </div>
                        <RenderResults />
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </KBarProvider>
    );
}

function RenderResults() {
    const { results } = useMatches();

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
