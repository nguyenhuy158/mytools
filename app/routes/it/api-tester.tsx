import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play, Check, AlertCircle, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/PageHeader";
import { HistorySection } from "../../components/HistorySection";

export function meta() {
  return [
    { title: "API Tester - Send HTTP Requests" },
    { name: "description", content: "Test API endpoints with a simple, client-side HTTP client." },
  ];
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export default function ApiTester() {
  const { t } = useTranslation();
  
  // Request State
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  
  // Response State
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("api-tester-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newItem: RequestHistoryItem) => {
    setHistory(prev => {
      // Remove duplicates based on method and URL to keep list clean? 
      // Or keep full history? Let's keep unique ID but maybe dedup similar requests if recent.
      // For now, simple list.
      const updated = [newItem, ...prev].slice(0, 20);
      localStorage.setItem("api-tester-history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("api-tester-history");
    toast.success(t("api_tester.toast.history_cleared"));
  };

  const handleSend = async () => {
    if (!url) {
      toast.error(t("api_tester.toast.url_required"));
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    const startTime = performance.now();

    try {
      // Parse headers
      const headerObj: Record<string, string> = {};
      if (headers) {
        headers.split('\n').forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            if (key) headerObj[key] = value;
          }
        });
      }

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      
      const resBody = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: resBody,
        time: Math.round(endTime - startTime),
        size: new Blob([resBody]).size
      });

      saveToHistory({
        id: Date.now().toString(),
        method,
        url,
        timestamp: Date.now()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryItem = (item: RequestHistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    // Note: We don't store headers/body in history for this simple version to save space/complexity
    // But we could add it if requested. For now, just URL/Method restoration.
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title={t("api_tester.title")}
          description={t("api_tester.description")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Request Area */}
          <div className="space-y-6">
            
            {/* Request Control */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {t("api_tester.actions.send")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("api_tester.labels.headers")} <span className="text-gray-400 text-xs font-normal">(Key: Value)</span>
                  </label>
                  <textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                    className="w-full h-32 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("api_tester.labels.body")}
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={method === 'GET' || method === 'HEAD'}
                    placeholder="{ 'key': 'value' }"
                    className="w-full h-32 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Response Area */}
            {(response || error) && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {error ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-green-500" />}
                    {t("api_tester.labels.response")}
                  </h3>
                  {response && (
                    <div className="flex gap-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-0.5 rounded ${response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {response.status} {response.statusText}
                      </span>
                      <span>{response.time}ms</span>
                      <span>{(response.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 overflow-x-auto">
                  {error ? (
                    <div className="text-red-500 font-mono p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {response?.headers && Object.keys(response.headers).length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-2">
                            {t("api_tester.labels.response_headers")}
                          </summary>
                          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg font-mono text-xs overflow-auto max-h-40">
                            {Object.entries(response.headers).map(([k, v]) => (
                              <div key={k}><span className="text-blue-600 dark:text-blue-400">{k}:</span> {v}</div>
                            ))}
                          </div>
                        </details>
                      )}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("api_tester.labels.response_body")}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(response?.body || "");
                              toast.success(t("api_tester.toast.copied"));
                            }}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="w-3 h-3" /> {t("api_tester.actions.copy")}
                          </button>
                        </div>
                        <pre className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[500px] text-gray-800 dark:text-gray-300">
                          {response?.body}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <HistorySection
              history={history}
              gridClassName="grid grid-cols-1 lg:grid-cols-2 gap-3"
              onRestore={loadHistoryItem}
              onRemove={(index) => {
                setHistory(prev => {
                  const updated = prev.filter((_, i) => i !== index);
                  localStorage.setItem("api-tester-history", JSON.stringify(updated));
                  return updated;
                });
              }}
              onClear={clearHistory}
              title={t("api_tester.history.title")}
              clearLabel={t("api_tester.actions.clear_all")}
              renderItem={(item) => (
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      item.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                      item.method === 'POST' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      item.method === 'DELETE' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
                    }`}>
                      {item.method}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm font-mono break-all text-gray-700 dark:text-gray-300" title={item.url}>
                    {item.url}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
