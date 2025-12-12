import { Icon } from "@iconify/react";
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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-5xl w-full space-y-6">
        <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Accidentally left the caps lock on and typed something, but can't be bothered to start again and retype it all?</h1>
            <p className="text-gray-600 dark:text-gray-400">
                Simply enter your text and choose the case you want to convert it to.
            </p>
        </header>

        <textarea
            className="w-full h-80 p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y text-lg"
            placeholder="Type or paste your content here"
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
            <Button onClick={toSentenceCase}>Sentence case</Button>
            <Button onClick={toLowerCase}>lower case</Button>
            <Button onClick={toUpperCase}>UPPER CASE</Button>
            <Button onClick={toCapitalizedCase}>Capitalized Case</Button>
            <Button onClick={toAlternatingCase}>aLtErNaTiNg cAsE</Button>
            <Button onClick={toTitleCase}>Title Case</Button>
            <Button onClick={toInverseCase}>InVeRsE CaSe</Button>
            <Button onClick={handleDownload} variant="secondary">
              <span className="flex items-center gap-2">
                <Icon icon="mdi:download" className="w-4 h-4" />
                Download Text
              </span>
            </Button>
            <Button onClick={handleCopy} variant="secondary">
              <span className="flex items-center gap-2">
                <Icon icon="mdi:content-copy" className="w-4 h-4" />
                Copy to Clipboard
              </span>
            </Button>
            <Button onClick={handleClear} variant="secondary">
              <span className="flex items-center gap-2">
                <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                Clear
              </span>
            </Button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 pt-4">
            <span>Character Count: {charCount}</span>
            <span className="mx-2">|</span>
            <span>Word Count: {wordCount}</span>
            <span className="mx-2">|</span>
            <span>Sentence Count: {sentenceCount}</span>
            <span className="mx-2">|</span>
            <span>Line Count: {lineCount}</span>
        </div>
      </div>
    </div>
  );
}

function Button({ children, onClick, variant = 'primary' }: { children: React.ReactNode, onClick: () => void, variant?: 'primary' | 'secondary' }) {
    // Styling buttons to look like the screenshot (rectangular, gray)
    let baseClass = "px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 cursor-pointer select-none";
    let variantClass = "";

    if (variant === 'primary') {
        variantClass = "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100";
    } else if (variant === 'secondary') {
        // Screenshot shows secondary buttons looking similar or same
        variantClass = "bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100";
    }

    return (
        <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
            {children}
        </button>
    )
}
