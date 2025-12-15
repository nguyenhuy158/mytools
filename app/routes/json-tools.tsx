import { Download, Upload, Copy, Trash2, FileJson, Check, Minimize, Maximize, Wrench, ClipboardPaste, Sparkles, ChevronDown, ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import JSON5 from "json5";
import { ButtonGroup } from "../components/ButtonGroup";
import { InputSection } from "../components/InputSection";
import { HistorySection } from "../components/HistorySection";
import { useLocalStorageHistory } from "../utils/history";

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
  const { history, setHistory, clearHistory, removeFromHistory } = useLocalStorageHistory<string>("json-tools-history");
  const [tabSize, setTabSize] = useState(() => {
    // Lazy init for tab size
    if (typeof localStorage !== 'undefined') {
       const saved = localStorage.getItem("json-tools-tab-size");
       return saved ? parseInt(saved, 10) : 4;
    }
    return 4;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setTabSize(newSize);
    localStorage.setItem("json-tools-tab-size", newSize.toString());
  };

  const addToHistory = (newText: string) => {
    if (!newText.trim()) return;
    
    setHistory((prev) => {
      // Avoid duplicates at the top of the list
      if (prev.length > 0 && prev[0] === newText) return prev;
      
      return [newText, ...prev].slice(0, 20); // Keep last 20 items
    });
  };


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
      const formatted = JSON.stringify(parsed, null, tabSize);
      setOutput(formatted);
      addToHistory(input);
      toast.success(t("json_tools.toast.formatted"));
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    const parsed = validate(input, false);
    if (parsed) {
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      addToHistory(input);
      toast.success(t("json_tools.toast.minified"));
    }
  };

  const handleFix = () => {
    if (!input.trim()) return;
    try {
      // 1. Handle Python literals
      let fixedInput = input
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");
      
      // 2. Decode unicode escapes (e.g. \\u00e0 -> à)
      // This handles double-escaped sequences common in logs/repr()
      fixedInput = fixedInput.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      );
      
      // 3. Parse using JSON5 (handles single quotes, trailing commas, etc.)
      const parsed = JSON5.parse(fixedInput);
      
      // 4. Convert back to standard JSON
      const formatted = JSON.stringify(parsed, null, tabSize);
      
      setOutput(formatted);
      setError(null);
      addToHistory(input); // Store original loose JSON or result? Storing input allows retry.
      toast.success(t("json_tools.toast.fixed"));
    } catch (e) {
      setError((e as Error).message);
      toast.error(t("json_tools.toast.invalid"));
    }
  };

  const handleValidate = () => {
    if (!input.trim()) return;
    validate(input);
    addToHistory(input);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(t("json_tools.toast.copied"));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        validate(text, false);
      }
    } catch (e) {
      console.error("Failed to read clipboard", e);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.info(t("json_tools.toast.clear_history_success"));
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

  const handleExample = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const json = await response.json();
      const text = JSON.stringify(json, null, tabSize);
      setInput(text);
      validate(text, false);
      toast.success(t("json_tools.toast.valid"));
    } catch (e) {
      toast.error(t("json_tools.toast.invalid"));
    }
  };

  const handleMoveToInput = () => {
    if (!output.trim()) return;
    setInput(output);
    validate(output, false);
    toast.success(t("json_tools.toast.valid"));
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

  const handleRestoreHistory = (item: string) => {
    setInput(item);
    validate(item, false);
    toast.success(t("json_tools.toast.history_restored"));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 items-start justify-center h-full">
        
        {/* Main Content */}
        <div className="flex-1 w-full space-y-6">
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
          <ButtonGroup>
              <div className="flex flex-wrap gap-2">
                  <Button onClick={handleFormat} variant="primary">
                      <Maximize className="w-4 h-4 mr-2" />
                      {t("json_tools.actions.format")}
                  </Button>
                  <Button onClick={handleFix} variant="outline">
                      <Wrench className="w-4 h-4 mr-2" />
                      {t("json_tools.actions.fix")}
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
              
              <div className="flex flex-wrap gap-2 border-l pl-0 md:pl-4 border-gray-200 dark:border-gray-700 items-center">
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-xs font-medium text-gray-500">{t("json_tools.actions.tab_size")}</span>
                    <div className="relative">
                      <select 
                        value={tabSize} 
                        onChange={handleTabSizeChange}
                        className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 text-xs rounded-md py-1.5 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>
                  </div>
                  <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={handleUpload}
                  />
                  <Button onClick={handleExample} variant="ghost">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("json_tools.actions.example")}
                  </Button>
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
          </ButtonGroup>

          {/* Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
              {/* Input */}
              <div className="flex flex-col h-full gap-2">
                <InputSection
                  label="Input"
                  value={input}
                  onChange={setInput}
                  placeholder={t("json_tools.input_placeholder")}
                  error={error}
                  actions={
                    <>
                      <button onClick={handlePaste} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors">
                          <ClipboardPaste className="w-3 h-3" /> {t("json_tools.actions.paste")}
                      </button>
                      <button onClick={() => handleCopy(input)} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors">
                          <Copy className="w-3 h-3" /> {t("json_tools.actions.copy")}
                      </button>
                    </>
                  }
                />
              </div>

              {/* Output */}
              <div className="flex flex-col h-full gap-2">
                <InputSection
                  label="Output"
                  value={output}
                  onChange={setOutput} // Readonly but we might want to edit output? 
                  readOnly={true} // Original was readonly but InputSection supports readOnly
                  placeholder="Output will appear here..."
                  actions={
                    <>
                      <button onClick={handleMoveToInput} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors">
                          <ArrowLeft className="w-3 h-3" /> {t("json_tools.actions.use_as_input")}
                      </button>
                      <button onClick={() => handleCopy(output)} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors">
                          <Copy className="w-3 h-3" /> {t("json_tools.actions.copy")}
                      </button>
                    </>
                  }
                />
              </div>
          </div>
        </div>

        <HistorySection
          history={history}
          onRestore={handleRestoreHistory}
          onRemove={removeFromHistory}
          onClear={handleClearHistory}
          title={t("json_tools.history")}
          clearLabel={t("json_tools.clear_all")}
          renderItem={(item) => (
            <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-3 font-mono break-all">
              {item.length > 150 ? item.substring(0, 150) + "..." : item}
            </p>
          )}
        />
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
