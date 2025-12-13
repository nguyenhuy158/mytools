import { Music, Volume2, VolumeX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SoundConfig {
  label: string;
  icon: LucideIcon;
}

interface SoundControlsProps<T extends string> {
  isPlaying: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  selectedSound: T;
  onSoundChange: (sound: T) => void;
  sounds: Record<T, SoundConfig>;
  title?: string;
  description?: string;
}

export function SoundControls<T extends string>({
  isPlaying,
  onToggle,
  volume,
  onVolumeChange,
  selectedSound,
  onSoundChange,
  sounds,
  title = "Background Sound",
  description = "Play ambient noise",
}: SoundControlsProps<T>) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPlaying ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isPlaying ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPlaying ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {isPlaying && (
        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(sounds) as [T, SoundConfig][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => onSoundChange(key)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    selectedSound === key
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                      : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            <Volume2 className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
