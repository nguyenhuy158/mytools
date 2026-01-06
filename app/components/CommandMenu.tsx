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
} from "lucide-react";

export function CommandMenu({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();

    const actions: Action[] = [
        {
            id: "home",
            name: "Home",
            shortcut: ["h"],
            keywords: "home dashboard index",
            perform: () => navigate("/"),
            icon: <Home className="w-4 h-4" />,
            section: "Navigation",
        },
        {
            id: "about",
            name: "About",
            shortcut: ["a"],
            keywords: "about info help",
            perform: () => navigate("/about"),
            icon: <Info className="w-4 h-4" />,
            section: "Navigation",
        },
        // IT Tools
        {
            id: "it",
            name: "IT Tools",
            keywords: "it developer tools dev",
            perform: () => navigate("/it"),
            icon: <Terminal className="w-4 h-4" />,
            section: "IT Tools",
        },
        {
            id: "json-tools",
            name: "JSON Tools",
            parent: "it",
            keywords: "json format validate minify",
            perform: () => navigate("/it/json-tools"),
            icon: <FileJson className="w-4 h-4" />,
        },
        {
            id: "text-diff",
            name: "Text Diff",
            parent: "it",
            keywords: "diff compare text",
            perform: () => navigate("/it/text-diff"),
            icon: <FileDiff className="w-4 h-4" />,
        },
        // Games
        {
            id: "games",
            name: "Games",
            keywords: "games play fun",
            perform: () => navigate("/games"),
            icon: <Gamepad2 className="w-4 h-4" />,
            section: "Games",
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
            icon: <Ghost className="w-4 h-4" />,
        },
        // Lifestyle
        {
            id: "lifestyle",
            name: "Lifestyle",
            keywords: "lifestyle productivity tools",
            perform: () => navigate("/lifestyle"),
            icon: <Coffee className="w-4 h-4" />,
            section: "Lifestyle",
        },
        {
            id: "pomodoro",
            name: "Pomodoro",
            parent: "lifestyle",
            keywords: "pomodoro timer focus work",
            perform: () => navigate("/lifestyle/pomodoro"),
            icon: <Timer className="w-4 h-4" />,
        },
        {
            id: "calendar",
            name: "Calendar",
            parent: "lifestyle",
            keywords: "calendar date event",
            perform: () => navigate("/calendar"),
            icon: <Calendar className="w-4 h-4" />,
        },
        {
            id: "quotes",
            name: "Quotes",
            parent: "lifestyle",
            keywords: "quotes motivation daily",
            perform: () => navigate("/lifestyle/quotes"),
            icon: <Quote className="w-4 h-4" />,
        },
    ];

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
                            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${active
                                ? "bg-zinc-100 dark:bg-zinc-800 border-l-4 border-black dark:border-white"
                                : "border-l-4 border-transparent"
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
                                            className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 font-mono"
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
