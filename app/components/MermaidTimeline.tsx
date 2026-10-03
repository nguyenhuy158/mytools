import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface TimelineItem {
  status: string;
  phase: string;
  title: string;
  items: Array<{
    name: string;
    desc: string;
    link?: string;
  }>;
}

interface MermaidTimelineProps {
  items: TimelineItem[];
}

export function MermaidTimeline({ items }: MermaidTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      themeVariables: {
        fontSize: "16px",
        fontFamily: "Be Vietnam Pro, sans-serif",
      },
    });
  }, []);

  // Keyed on the definition text, not the `items` array: the parent rebuilds
  // that array on every render (e.g. when the About page's map finishes
  // loading), and re-rendering mid-layout detached the diagram mermaid was
  // still measuring, rejecting run() with "reading 'getBBox'".
  const mermaidDef = `timeline
    ${items
      .map((item) => {
        const itemsList = item.items.map((i) => `${i.name}: ${i.desc}`).join(" : ");
        return `${item.phase} : ${item.title} : ${itemsList}`;
      })
      .join("\n    ")}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.textContent = "";

    // Inject style to override Tailwind's max-width: 100% on SVGs within this container
    const style = document.createElement("style");
    style.textContent = `
        .mermaid-wrapper svg {
          max-width: none !important;
          width: auto !important;
        }
      `;
    container.appendChild(style);

    const pre = document.createElement("pre");
    pre.className = "mermaid";
    pre.textContent = mermaidDef;
    container.appendChild(pre);

    let replaced = false;
    mermaid.run({ nodes: [pre] }).catch((error) => {
      // A newer definition replaced this diagram mid-render; only report live failures.
      if (!replaced) console.error("Mermaid timeline failed to render", error);
    });
    return () => {
      replaced = true;
    };
  }, [mermaidDef]);

  return (
    <div
      ref={containerRef}
      className="mermaid-wrapper w-full overflow-x-auto bg-white/15 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-8 border border-white/20 dark:border-white/10"
    />
  );
}
