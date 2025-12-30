declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getDay(): number;
    getMonth(): number;
    getYear(): number;
  }
}

// Lô Tô Game Types
export interface LotoCard {
  id: string;
  grid: (number | null)[][]; // 9×3 grid, null = blank
}

export interface LotoPlayer {
  id: string;
  name: string;
  cards: LotoCard[];
  markedCells: Set<string>; // "cardIndex:row:col"
  hasWon: boolean;
  connectedAt: number;
}

export interface LotoGameRoom {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  players: Map<string, LotoPlayer>;
  calledNumbers: number[];
  currentNumber: number | null;
  winner: string | null;
  hostId: string;
  createdAt: number;
  startedAt: number | null;
}

// WebSocket Message Types
export type LotoClientMessage =
  | { type: 'join'; name: string }
  | { type: 'start_game' }
  | { type: 'mark_cell'; cardIndex: number; row: number; col: number }
  | { type: 'call_next_number' };

export type LotoServerMessage =
  | { type: 'joined'; playerId: string; cards: LotoCard[]; roomId: string }
  | { type: 'player_joined'; player: Omit<LotoPlayer, 'cards' | 'markedCells'> }
  | { type: 'player_left'; playerId: string }
  | { type: 'game_started'; calledNumbers: number[] }
  | { type: 'number_called'; number: number; sequence: number[] }
  | { type: 'cell_marked'; playerId: string; cardIndex: number; row: number; col: number }
  | { type: 'player_won'; playerId: string; playerName: string }
  | { type: 'game_ended'; winner: string }
  | { type: 'room_state'; state: LotoGameRoomState }
  | { type: 'error'; message: string };

export interface LotoGameRoomState {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  players: Array<{
    id: string;
    name: string;
    markedCount: number;
    hasWon: boolean;
  }>;
  calledNumbers: number[];
  currentNumber: number | null;
  winner: string | null;
  hostId: string;
}
