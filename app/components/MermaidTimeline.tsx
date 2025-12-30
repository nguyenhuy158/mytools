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
    title Project Roadmap
    ${timelineEvents}`;

      containerRef.current.textContent = "";
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
      className="flex justify-center items-center bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 overflow-x-auto"
    />
  );
}
