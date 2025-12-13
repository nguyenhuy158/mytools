interface GameScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export function GameScore({ score, label = "Score", className = "" }: GameScoreProps) {
  return (
    <div className={`bg-gray-800 text-white p-3 rounded-lg text-center min-w-[100px] ${className}`}>
      <div className="text-xs uppercase font-bold text-gray-400">{label}</div>
      <div className="text-xl font-bold">{score}</div>
    </div>
  );
}
