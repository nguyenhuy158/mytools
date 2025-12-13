import type { ReactNode } from "react";
import { RefreshCcw } from "lucide-react";

interface GameOverlayProps {
  isVisible: boolean;
  title: string;
  message?: string;
  onRestart?: () => void;
  restartLabel?: string;
  children?: ReactNode;
}

export function GameOverlay({ 
  isVisible, 
  title, 
  message, 
  onRestart, 
  restartLabel = "Try Again", 
  children 
}: GameOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 rounded-xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
      {message && (
        <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">{message}</p>
      )}
      
      {children}

      {onRestart && (
        <button
          onClick={onRestart}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-lg font-medium transition-colors mt-4"
        >
          <RefreshCcw className="w-4 h-4" /> {restartLabel}
        </button>
      )}
    </div>
  );
}
