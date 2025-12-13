import { Trophy } from "lucide-react";

interface Score {
  name: string;
  score: number;
  date: string;
}

interface LeaderboardProps {
  scores: Score[];
  title?: string;
  emptyMessage?: string;
}

export function Leaderboard({ 
  scores, 
  title = "Leaderboard", 
  emptyMessage = "No scores yet. Be the first!" 
}: LeaderboardProps) {
  return (
    <div className="w-full lg:w-80 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {scores.length === 0 ? (
          <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
        ) : (
          scores.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                  idx === 1 ? "bg-gray-200 text-gray-700" :
                  idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                    {s.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(s.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="font-bold text-indigo-600 dark:text-indigo-400">
                {s.score}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
