import { memo } from "react";
import { useTranslation } from "react-i18next";

interface LotoControlsProps {
  isHost: boolean;
  gameStatus: 'waiting' | 'active' | 'completed';
  roomId: string;
  playersCount: number;
  onStartGame: () => void;
  onCallNextNumber: () => void;
}

export const LotoControls = memo(function LotoControls({
  isHost,
  gameStatus,
  roomId,
  playersCount,
  onStartGame,
  onCallNextNumber
}: LotoControlsProps) {
  const { t } = useTranslation();

  const copyRoomLink = () => {
    const link = `${window.location.origin}/games/loto?room=${roomId}`;
    navigator.clipboard.writeText(link);
    // TODO: Show toast notification
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('loto.room_info')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('loto.room_code')}: <span className="font-mono font-bold">{roomId.slice(0, 8)}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('loto.players_count', { count: playersCount })}
        </p>
        {isHost && (
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
            {t('loto.you_are_host')}
          </p>
        )}
      </div>

      <button
        onClick={copyRoomLink}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        {t('loto.copy_room_link')}
      </button>

      {isHost && gameStatus === 'waiting' && (
        <button
          onClick={onStartGame}
          disabled={playersCount < 2}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
        >
          {t('loto.start_game')}
        </button>
      )}

      {isHost && gameStatus === 'active' && (
        <button
          onClick={onCallNextNumber}
          className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          {t('loto.call_next')}
        </button>
      )}

      {!isHost && gameStatus === 'waiting' && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-2">
          {t('loto.waiting_for_host')}
        </div>
      )}

      {gameStatus === 'completed' && (
        <div className="text-center text-green-600 dark:text-green-400 font-bold py-2">
          {t('loto.game_completed')}
        </div>
      )}
    </div>
  );
});
