import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setStatus("error");
        setMessage(t("newsletter.error_invalid"));
        return;
    }

    setStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
        // Success simulation
        setStatus("success");
        setMessage(t("newsletter.success"));
        setEmail("");
        toast.success(t("newsletter.success"));
        
        // Reset after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("app_name")}
             </h3>
             <p className="text-slate-500 dark:text-gray-400 max-w-sm">
                {t("home.description")}
             </p>
              <div className="text-sm text-slate-400 dark:text-gray-500">
                © {new Date().getFullYear()} {t("app_name")}. {t("newsletter.all_rights_reserved")}
              </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Mail className="w-5 h-5" />
               {t("newsletter.title")}
             </h3>
             <p className="text-slate-500 dark:text-gray-400">
               {t("newsletter.description")}
             </p>
             
             <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder={t("newsletter.placeholder")}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if(status === 'error') setStatus('idle');
                    }}
                    disabled={status === "loading" || status === "success"}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:outline-none transition-all
                      ${status === 'error' 
                        ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-transparent'
                      }
                      text-slate-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-60`}
                  />
                  {status === 'error' && (
                     <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                <button
                   type="submit"
                   disabled={status === "loading" || status === "success" || !email}
                   className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 min-w-[120px]
                     ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                     disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20`}
                >
                   {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                   ) : status === "success" ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t("newsletter.button_success")}
                      </>
  ) : (
    <>{t("newsletter.button")}</>
  )}
                </button>
             </form>
             {status === 'error' && <p className="text-red-500 text-sm">{message}</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
