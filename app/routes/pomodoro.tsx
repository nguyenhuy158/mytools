import { useState, useEffect, useRef } from "react";
import type { MetaArgs } from "react-router";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from "lucide-react";

export function meta({}: MetaArgs) {
  return [
    { title: "Pomodoro Timer - MyTools" },
    { name: "description", content: "Focus timer with ambient background sounds." },
  ];
}

// Sound assets
const SOUNDS = {
  rain: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3",
  wind: "https://assets.mixkit.co/sfx/preview/mixkit-wind-blowing-sfx-12-1262.mp3",
  fire: "https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3",
  water: "https://assets.mixkit.co/sfx/preview/mixkit-river-stream-loop-1215.mp3",
};

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";
type SoundType = keyof typeof SOUNDS;

const MODES: Record<TimerMode, { label: string; minutes: number }> = {
  pomodoro: { label: "Pomodoro", minutes: 25 },
  shortBreak: { label: "Short Break", minutes: 5 },
  longBreak: { label: "Long Break", minutes: 15 },
};

export default function Pomodoro() {
  // Timer State
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Sound State
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundType>("rain");
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio ref
  useEffect(() => {
    audioRef.current = new Audio(SOUNDS[selectedSound]);
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle sound changes
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        
        // Update src
        audioRef.current.src = SOUNDS[selectedSound];
        audioRef.current.volume = volume;
        
        // Resume if it was playing or if isPlayingSound is true
        if (isPlayingSound) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    }
  }, [selectedSound, isPlayingSound]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Optional: Play alarm sound here
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSound = () => {
    setIsPlayingSound(!isPlayingSound);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Pomodoro Timer</h1>
          <p className="text-slate-500 dark:text-gray-400">Stay focused and productive.</p>
        </header>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 space-y-8 text-center">
          
          {/* Mode Selector */}
          <div className="flex justify-center gap-2">
            {(Object.keys(MODES) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-8xl font-bold font-mono tracking-wider text-slate-800 dark:text-white">
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                isRunning
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-gray-100 text-slate-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sound Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPlayingSound ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Background Sound</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Play ambient noise</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                isPlayingSound ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPlayingSound ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isPlayingSound && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SOUNDS) as SoundType[]).map((sound) => (
                  <button
                    key={sound}
                    onClick={() => setSelectedSound(sound)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      selectedSound === sound
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                        : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400"
                    }`}
                  >
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                />
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
