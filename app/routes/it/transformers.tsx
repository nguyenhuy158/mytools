import { Brain, Sparkles, Loader2, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { InputSection } from "../../components/InputSection";
// Import worker
import SentimentWorker from "../../workers/sentiment.worker?worker";

export function meta() {
    return [
        { title: "AI Playground - Transformers.js" },
        { name: "description", content: "Run advanced AI models directly in your browser with privacy-first Transformers.js integration." },
    ];
}

export default function TransformersPlayground() {
    const { t } = useTranslation();
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "analyzing" | "complete" | "error">("idle");
    const [progress, setProgress] = useState<any>(null);

    const worker = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize worker
        try {
            worker.current = new SentimentWorker();

            worker.current.onmessage = (event) => {
                const { status, output, error, ...data } = event.data;

                if (status === 'progress') {
                    setProgress(data);
                    setStatus("loading");
                } else if (status === 'complete') {
                    setOutput(output);
                    setStatus("complete");
                    toast.success(t("transformers.result"));
                } else if (status === 'error') {
                    console.error(error);
                    toast.error("Error: " + error);
                    setStatus("error");
                }
            };
        } catch (e) {
            console.error("Failed to initialize worker", e);
            toast.error("Failed to initialize AI worker");
        }

        return () => {
            worker.current?.terminate();
        };
    }, [t]);

    const handleAnalyze = () => {
        if (!input.trim()) return;
        setStatus("analyzing");
        setOutput(null);
        worker.current?.postMessage({ text: input });
    };

    const handleExample = () => {
        // A nice example that shows nuance
        const text = "I'm amazed by how fast this runs in the browser, though setting it up was a bit tricky.";
        setInput(text);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                        {t("transformers.title")}
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-lg">
                        {t("transformers.description")}
                    </p>
                </header>

                <main className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            {t("transformers.sentiment")}
                        </h2>

                        <div className="space-y-4">
                            <InputSection
                                label={t("transformers.input_placeholder")}
                                value={input}
                                onChange={setInput}
                                placeholder={t("transformers.input_placeholder")}
                                className="h-48"
                            />

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleExample}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    Example
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={status === 'loading' || status === 'analyzing' || !input.trim()}
                                    className={`
                           flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all
                           ${status === 'loading' || status === 'analyzing'
                                            ? 'bg-purple-400 cursor-wait'
                                            : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 active:scale-95'}
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                         `}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t("transformers.loading_model")} {progress ? `(${Math.round(progress.progress || 0)}%)` : ''}
                                        </>
                                    ) : status === 'analyzing' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t("transformers.analyze")}...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            {t("transformers.analyze")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {output && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t("transformers.result")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {output.map((item: any, idx: number) => (
                                    <div key={idx} className={`
                              p-4 rounded-lg border-l-4 flex justify-between items-center shadow-sm
                              ${item.label === 'POSITIVE'
                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-500 text-green-700 dark:text-green-300'
                                            : 'bg-red-50 dark:bg-red-900/10 border-red-500 text-red-700 dark:text-red-300'}
                           `}>
                                        <span className="font-bold text-lg">
                                            {item.label === 'POSITIVE' ? t("transformers.positive") : t("transformers.negative")}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-xs opacity-70 block mb-1">{t("transformers.score")}</span>
                                            <span className="font-mono text-2xl font-bold">{(item.score * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
