import { memo } from "react";
import { useTranslation } from "react-i18next";

interface Player {
  id: string;
  name: string;
  markedCount: number;
  hasWon: boolean;
}

interface LotoPlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId: string | null;
}

export const LotoPlayerList = memo(function LotoPlayerList({
  players,
  hostId,
  currentPlayerId
}: LotoPlayerListProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t('loto.players')} ({players.length})
      </h3>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`
              p-3 rounded-lg border-2
              ${player.id === currentPlayerId
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {player.name}
                </span>
                {player.id === hostId && (
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded">
                    {t('loto.host')}
                  </span>
                )}
                {player.id === currentPlayerId && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                    {t('loto.you')}
                  </span>
                )}
                {player.hasWon && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded">
                    {t('loto.winner')}
                  </span>
                )}
              </div>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {player.markedCount} {t('loto.marked')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
