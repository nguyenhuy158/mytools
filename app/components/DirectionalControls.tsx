import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { SwipeDirection } from "../utils/touch";

interface DirectionalControlsProps {
  onDirection: (direction: SwipeDirection) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * On-screen directional control buttons for mobile game controls.
 * Provides touch-friendly arrow buttons with visual feedback.
 */
export function DirectionalControls({
  onDirection,
  className = "",
  disabled = false,
}: DirectionalControlsProps) {
  const handleDirection = (direction: SwipeDirection) => {
    if (!disabled) {
      onDirection(direction);
    }
  };

  const buttonClass = `
    flex items-center justify-center
    w-14 h-14 md:w-12 md:h-12
    rounded-lg
    bg-gray-200 dark:bg-gray-700
    text-gray-700 dark:text-gray-200
    active:bg-gray-300 dark:active:bg-gray-600
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
    touch-none
    select-none
  `;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Up button */}
      <button
        type="button"
        onClick={() => handleDirection("UP")}
        disabled={disabled}
        className={buttonClass}
        aria-label="Up"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Left, Down, Right buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleDirection("LEFT")}
          disabled={disabled}
          className={buttonClass}
          aria-label="Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => handleDirection("DOWN")}
          disabled={disabled}
          className={buttonClass}
          aria-label="Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => handleDirection("RIGHT")}
          disabled={disabled}
          className={buttonClass}
          aria-label="Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

