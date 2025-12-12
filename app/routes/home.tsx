import { Download, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Case Converter - Cloudflare" },
    { name: "description", content: "Convert text case easily." },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: "Powered by Cloudflare Pages" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [text, setText] = useState("");

  const toSentenceCase = () => {
    const res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(res);
  };

  const toLowerCase = () => setText(text.toLowerCase());
  const toUpperCase = () => setText(text.toUpperCase());

  const toCapitalizedCase = () => {
    // Capitalize first letter of each word
    setText(text.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()));
  };

  const toAlternatingCase = () => {
    let res = "";
    for (let i = 0; i < text.length; i++) {
        // Alternating based on index
        res += i % 2 === 0 ? text[i].toLowerCase() : text[i].toUpperCase();
    }
    setText(res);
  };

  const toTitleCase = () => {
      // Smart title case (simple version: lowercase minor words unless first word)
      const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'over', 'in', 'of', 'with']);
      const res = text.toLowerCase().split(/\s+/).map((word, index) => {
          if (index > 0 && minorWords.has(word)) {
              return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      setText(res);
  };

  const toInverseCase = () => {
    let res = "";
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        res += c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    }
    setText(res);
  };

  const handleDownload = () => {
      if (!text) return;
      const element = document.createElement("a");
      const file = new Blob([text], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "text.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  const handleCopy = () => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      // Optional: show toast, but keeping it simple as per screenshot
  };

  const handleClear = () => setText("");

  // Counts
  const charCount = text.length;
  // Word count logic: split by whitespace and filter empty strings
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
  // Sentence count: approximate counting .!?
  const sentenceCount = text.trim() === "" ? 0 : (text.match(/[.!?]+/g) || []).length;
  const lineCount = text === "" ? 0 : text.split(/\n/).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-5xl w-full space-y-6">
        <header className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Case Converter
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-lg">
                Accidentally left the caps lock on? Simply enter your text and choose the case you want to convert it to.
            </p>
        </header>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <textarea
              className="w-full h-80 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-y text-lg text-slate-700 dark:text-gray-300 placeholder-gray-400 transition-all"
              placeholder="Type or paste your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
          />

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap gap-2 flex-1">
                <Button onClick={toSentenceCase} variant="outline">Sentence case</Button>
                <Button onClick={toLowerCase} variant="outline">lower case</Button>
                <Button onClick={toUpperCase} variant="outline">UPPER CASE</Button>
                <Button onClick={toCapitalizedCase} variant="outline">Capitalized Case</Button>
                <Button onClick={toAlternatingCase} variant="outline">aLtErNaTiNg cAsE</Button>
                <Button onClick={toTitleCase} variant="outline">Title Case</Button>
                <Button onClick={toInverseCase} variant="outline">InVeRsE CaSe</Button>
            </div>
            
            <div className="flex flex-wrap gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-4">
                <Button onClick={handleCopy} variant="primary">
                  <span className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </span>
                </Button>
                <Button onClick={handleDownload} variant="ghost">
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </span>
                </Button>
                <Button onClick={handleClear} variant="danger">
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </span>
                </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-gray-500 flex justify-center gap-6 bg-white dark:bg-gray-900 py-3 px-6 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 w-fit mx-auto">
            <span><strong className="text-slate-900 dark:text-gray-200">{charCount}</strong> Characters</span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span><strong className="text-slate-900 dark:text-gray-200">{wordCount}</strong> Words</span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span><strong className="text-slate-900 dark:text-gray-200">{sentenceCount}</strong> Sentences</span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span><strong className="text-slate-900 dark:text-gray-200">{lineCount}</strong> Lines</span>
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
