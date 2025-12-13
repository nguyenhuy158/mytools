import type { ReactNode } from "react";

interface GameGridProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GameGrid({ children, className = "", style }: GameGridProps) {
  return (
    <div 
      className={`relative bg-gray-300 dark:bg-gray-700 p-4 rounded-xl shadow-lg touch-none ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
