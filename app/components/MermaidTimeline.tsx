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
        fontFamily: "Inter, sans-serif",
      },
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const timelineEvents = items
        .map((item) => {
          const itemsList = item.items
            .map((i) => `${i.name}: ${i.desc}`)
            .join(" : ");
          return `${item.phase} : ${item.title} : ${itemsList}`;
        })
        .join("\n    ");

      const mermaidDef = `timeline
    ${timelineEvents}`;

      containerRef.current.textContent = "";
      
      // Inject style to override Tailwind's max-width: 100% on SVGs within this container
      const style = document.createElement("style");
      style.textContent = `
        .mermaid-wrapper svg {
          max-width: none !important;
          width: auto !important;
        }
      `;
      containerRef.current.appendChild(style);

      const pre = document.createElement("pre");
      pre.className = "mermaid";
      pre.textContent = mermaidDef;
      containerRef.current.appendChild(pre);

      mermaid.run();
    }
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="mermaid-wrapper w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-8 border border-gray-200 dark:border-gray-800"
    />
  );
}
