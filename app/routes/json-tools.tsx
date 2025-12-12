import { Download, Upload, Copy, Trash2, FileJson, Check, XCircle, Minimize, Maximize } from "lucide-react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function meta() {
  return [
    { title: "JSON Tools - Format, Validate, Minify" },
    { name: "description", content: "Free online JSON formatter, validator, and minifier." },
  ];
}

export default function JsonTools() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (json: string, showToast = true) => {
    try {
      const parsed = JSON.parse(json);
      setError(null);
      if (showToast) toast.success(t("json_tools.toast.valid"));
      return parsed;
    } catch (e) {
      setError((e as Error).message);
      if (showToast) toast.error(t("json_tools.toast.invalid"));
      return null;
    }
  };

  const handleFormat = () => {
    if (!input.trim()) return;
    const parsed = validate(input, false);
    if (parsed) {
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      toast.success(t("json_tools.toast.formatted"));
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    const parsed = validate(input, false);
    if (parsed) {
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      toast.success(t("json_tools.toast.minified"));
    }
  };

  const handleValidate = () => {
    if (!input.trim()) return;
    validate(input);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(t("json_tools.toast.copied"));
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
        validate(text, false); // Validate immediately
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const content = output || input;
    if (!content) return;
    
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FileJson className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            {t("json_tools.title")}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            {t("json_tools.description")}
          </p>
        </header>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat} variant="primary">
                    <Maximize className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.format")}
                </Button>
                <Button onClick={handleMinify} variant="outline">
                    <Minimize className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.minify")}
                </Button>
                <Button onClick={handleValidate} variant="outline">
                    <Check className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.validate")}
                </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 border-l pl-0 md:pl-4 border-gray-200 dark:border-gray-700">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleUpload}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="ghost">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.upload")}
                </Button>
                <Button onClick={handleDownload} variant="ghost">
                    <Download className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.download")}
                </Button>
                <Button onClick={handleClear} variant="danger">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("json_tools.actions.clear")}
                </Button>
            </div>
        </div>

        {/* Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
            {/* Input */}
            <div className="flex flex-col gap-2 h-full">
                <div className="flex justify-between items-center px-1">
                    <span className="font-semibold text-sm text-gray-500">Input</span>
                    <button onClick={() => handleCopy(input)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                    </button>
                </div>
                <textarea
                    className={`w-full flex-1 p-4 border rounded-xl bg-white dark:bg-gray-900 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'
                    }`}
                    placeholder={t("json_tools.input_placeholder")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                />
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-mono break-all">{error}</span>
                    </div>
                )}
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2 h-full">
                <div className="flex justify-between items-center px-1">
                    <span className="font-semibold text-sm text-gray-500">Output</span>
                    <button onClick={() => handleCopy(output)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                    </button>
                </div>
                <textarea
                    className="w-full flex-1 p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 font-mono text-sm resize-none focus:outline-none cursor-text"
                    readOnly
                    value={output}
                    placeholder="Output will appear here..."
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function Button({ children, onClick, variant = 'outline' }: { children: React.ReactNode, onClick: () => void, variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) {
    const baseClass = "px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer select-none flex items-center justify-center";
    
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500",
        secondary: "bg-gray-100 hover:bg-gray-200 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
        outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
    };

    return (
        <button onClick={onClick} className={`${baseClass} ${variants[variant]}`}>
            {children}
        </button>
    )
}
