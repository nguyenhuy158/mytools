import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryState, parseAsString } from "nuqs";
import { useTranslation } from "react-i18next";
import type { LotoCard, LotoServerMessage, LotoGameRoomState } from "../../types.d";
import { LotoCard as LotoCardComponent } from "../../components/LotoCard";
import { CalledNumbersDisplay } from "../../components/CalledNumbersDisplay";
import { LotoControls } from "../../components/LotoControls";
import { LotoPlayerList } from "../../components/LotoPlayerList";
import { PageHeader } from "../../components/PageHeader";

export default function LotoGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'lobby' | 'joining' | 'playing'>('lobby');
  const [playerName, setPlayerName] = useQueryState('name', parseAsString.withDefault(""));
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useQueryState('room', parseAsString.withDefault(""));

  // Game state
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [myCards, setMyCards] = useState<LotoCard[]>([]);
  const [markedCells, setMarkedCells] = useState<Set<string>>(new Set());
  const [roomState, setRoomState] = useState<LotoGameRoomState | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const createRoom = async () => {
    if (!playerName.trim()) {
      setError(t('loto.enter_name'));
      return;
    }

    try {
      const response = await fetch('/api/loto/create-room', {
        method: 'POST'
      });
      const data = await response.json() as { success: boolean; roomId?: string; error?: string };

      if (data.success && data.roomId) {
        setRoomId(data.roomId);
        connectToRoom(data.roomId, playerName);
      } else {
        setError(data.error || t('loto.failed_create_room'));
      }
    } catch (err) {
      setError(t('loto.failed_create_room'));
    }
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      setError(t('loto.enter_name'));
      return;
    }
    if (!joinRoomId.trim()) {
      setError(t('loto.enter_room_code'));
      return;
    }

    connectToRoom(joinRoomId, playerName);
  };

  const connectToRoom = (room: string, name: string) => {
    setError(null);
    setGameState('joining');
    setRoomId(room);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/loto/room/${room}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'join',
        name
      }));
    };

    ws.onmessage = (event) => {
      const message: LotoServerMessage = JSON.parse(event.data);
      handleServerMessage(message);
    };

    ws.onerror = () => {
      setError(t('loto.connection_error'));
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setError(t('loto.connection_closed'));
    };
  };

  const handleServerMessage = (message: LotoServerMessage) => {
    switch (message.type) {
      case 'joined':
        setPlayerId(message.playerId);
        setMyCards(message.cards);
        setGameState('playing');
        break;

      case 'room_state':
        setRoomState(message.state);
        break;

      case 'player_joined':
      case 'player_left':
        // Room state will be updated via room_state message
        break;

      case 'game_started':
        if (roomState) {
          setRoomState({ ...roomState, status: 'active' });
        }
        break;

      case 'number_called':
        if (roomState) {
          setRoomState({
            ...roomState,
            currentNumber: message.number,
            calledNumbers: message.sequence
          });
        }
        break;

      case 'cell_marked':
        if (message.playerId === playerId) {
          const cellKey = `${message.cardIndex}:${message.row}:${message.col}`;
          setMarkedCells(prev => new Set(prev).add(cellKey));
        }
        break;

      case 'player_won':
        if (roomState) {
          setRoomState({ ...roomState, status: 'completed', winner: message.playerId });
        }
        if (message.playerId === playerId) {
          alert(t('loto.you_won'));
        } else {
          alert(t('loto.player_won_message', { name: message.playerName }));
        }
        break;

      case 'game_ended':
        if (roomState) {
          setRoomState({ ...roomState, status: 'completed' });
        }
        break;

      case 'error':
        setError(message.message);
        break;
    }
  };

  const handleCellClick = (cardIndex: number, row: number, col: number) => {
    if (!wsRef.current || !isConnected) return;

    wsRef.current.send(JSON.stringify({
      type: 'mark_cell',
      cardIndex,
      row,
      col
    }));
  };

  const handleStartGame = () => {
    if (!wsRef.current || !isConnected) return;

    wsRef.current.send(JSON.stringify({
      type: 'start_game'
    }));
  };

  const handleCallNextNumber = () => {
    if (!wsRef.current || !isConnected) return;

    wsRef.current.send(JSON.stringify({
      type: 'call_next_number'
    }));
  };

  const leaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setGameState('lobby');
    setRoomId("");
    setPlayerId(null);
    setMyCards([]);
    setMarkedCells(new Set());
    setRoomState(null);
    setError(null);
  };

  // Lobby view
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PageHeader
          title={t('loto.title')}
          description={t('loto.description')}
        />

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('loto.join_or_create')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('loto.your_name')}
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('loto.enter_your_name')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  maxLength={20}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={createRoom}
                  disabled={!playerName.trim()}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
                >
                  {t('loto.create_room')}
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('loto.room_code')}
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder={t('loto.enter_room_code')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
                />
                <button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !joinRoomId.trim()}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
                >
                  {t('loto.join_room')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Joining view
  if (gameState === 'joining') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loto.connecting')}</p>
        </div>
      </div>
    );
  }

  // Playing view
  if (gameState === 'playing' && roomState) {
    const isHost = playerId === roomState.hostId;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('loto.title')}
            </h1>
            <button
              onClick={leaveRoom}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('loto.leave_room')}
            </button>
          </div>

          {!isConnected && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg">
              {t('loto.disconnected')}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - Controls and Players */}
            <div className="space-y-6">
              <LotoControls
                isHost={isHost}
                gameStatus={roomState.status}
                roomId={roomId}
                playersCount={roomState.players.length}
                onStartGame={handleStartGame}
                onCallNextNumber={handleCallNextNumber}
              />

              <LotoPlayerList
                players={roomState.players}
                hostId={roomState.hostId}
                currentPlayerId={playerId}
              />
            </div>

            {/* Main area - Cards and Numbers */}
            <div className="lg:col-span-2 space-y-6">
              <CalledNumbersDisplay
                calledNumbers={roomState.calledNumbers}
                currentNumber={roomState.currentNumber}
              />

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t('loto.your_cards')}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {myCards.map((card, index) => (
                    <LotoCardComponent
                      key={card.id}
                      card={card}
                      cardIndex={index}
                      markedCells={markedCells}
                      calledNumbers={roomState.calledNumbers}
                      currentNumber={roomState.currentNumber}
                      onCellClick={handleCellClick}
                      isInteractive={roomState.status === 'active'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
