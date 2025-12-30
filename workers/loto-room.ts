import { DurableObject } from "cloudflare:workers";
import type { LotoCard, LotoPlayer, LotoClientMessage, LotoServerMessage } from "../app/types.d";
import { generateLotoCard, hasWinningRow, getNextNumber } from "../app/utils/loto";

interface LotoGameState {
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

export class LotoGameRoom extends DurableObject {
  private state: LotoGameState;
  private sessions: Map<string, WebSocket>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.sessions = new Map();
    this.state = {
      id: ctx.id.toString(),
      status: 'waiting',
      players: new Map(),
      calledNumbers: [],
      currentNumber: null,
      winner: null,
      hostId: '',
      createdAt: Date.now(),
      startedAt: null
    };
  }

  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get('Upgrade');
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data = JSON.parse(message as string) as LotoClientMessage;

      switch (data.type) {
        case 'join':
          await this.handleJoin(ws, data.name);
          break;
        case 'start_game':
          await this.handleStartGame(ws);
          break;
        case 'call_next_number':
          await this.handleCallNextNumber(ws);
          break;
        case 'mark_cell':
          await this.handleMarkCell(ws, data.cardIndex, data.row, data.col);
          break;
      }
    } catch (error) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    // Find and remove the player
    for (const [playerId, session] of this.sessions.entries()) {
      if (session === ws) {
        this.sessions.delete(playerId);
        this.state.players.delete(playerId);

        this.broadcast({
          type: 'player_left',
          playerId
        }, playerId);
        break;
      }
    }
  }

  private async handleJoin(ws: WebSocket, playerName: string): Promise<void> {
    const playerId = crypto.randomUUID();

    // Generate 1-3 cards for the player (let's default to 1 for simplicity)
    const cards: LotoCard[] = [generateLotoCard()];

    const player: LotoPlayer = {
      id: playerId,
      name: playerName,
      cards,
      markedCells: new Set(),
      hasWon: false,
      connectedAt: Date.now()
    };

    // Set first player as host
    if (this.state.players.size === 0) {
      this.state.hostId = playerId;
    }

    this.state.players.set(playerId, player);
    this.sessions.set(playerId, ws);

    // Send join confirmation to the new player
    this.sendToWebSocket(ws, {
      type: 'joined',
      playerId,
      cards,
      roomId: this.state.id
    });

    // Send current room state to the new player
    this.sendRoomState(ws);

    // Notify other players
    this.broadcast({
      type: 'player_joined',
      player: {
        id: player.id,
        name: player.name,
        connectedAt: player.connectedAt,
        hasWon: player.hasWon
      }
    }, playerId);
  }

  private async handleStartGame(ws: WebSocket): Promise<void> {
    const playerId = this.getPlayerIdByWebSocket(ws);

    if (!playerId || playerId !== this.state.hostId) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Only the host can start the game'
      });
      return;
    }

    if (this.state.status !== 'waiting') {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Game has already started'
      });
      return;
    }

    if (this.state.players.size < 2) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Need at least 2 players to start'
      });
      return;
    }

    this.state.status = 'active';
    this.state.startedAt = Date.now();

    this.broadcast({
      type: 'game_started',
      calledNumbers: []
    });

    // Auto-call first number
    await this.callNumber();
  }

  private async handleCallNextNumber(ws: WebSocket): Promise<void> {
    const playerId = this.getPlayerIdByWebSocket(ws);

    if (!playerId || playerId !== this.state.hostId) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Only the host can call numbers'
      });
      return;
    }

    if (this.state.status !== 'active') {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Game is not active'
      });
      return;
    }

    await this.callNumber();
  }

  private async callNumber(): Promise<void> {
    const nextNumber = getNextNumber(this.state.calledNumbers);

    if (nextNumber === null) {
      this.broadcast({
        type: 'game_ended',
        winner: 'No winner - all numbers called'
      });
      this.state.status = 'completed';
      return;
    }

    this.state.calledNumbers.push(nextNumber);
    this.state.currentNumber = nextNumber;

    this.broadcast({
      type: 'number_called',
      number: nextNumber,
      sequence: this.state.calledNumbers
    });
  }

  private async handleMarkCell(
    ws: WebSocket,
    cardIndex: number,
    row: number,
    col: number
  ): Promise<void> {
    const playerId = this.getPlayerIdByWebSocket(ws);
    if (!playerId) return;

    const player = this.state.players.get(playerId);
    if (!player) return;

    if (this.state.status !== 'active') {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Game is not active'
      });
      return;
    }

    // Validate the mark
    if (cardIndex < 0 || cardIndex >= player.cards.length) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Invalid card index'
      });
      return;
    }

    const card = player.cards[cardIndex];
    if (row < 0 || row >= 3 || col < 0 || col >= 9) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Invalid cell coordinates'
      });
      return;
    }

    const cellValue = card.grid[row][col];
    if (cellValue === null) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Cannot mark empty cell'
      });
      return;
    }

    // Check if the number has been called
    if (!this.state.calledNumbers.includes(cellValue)) {
      this.sendToWebSocket(ws, {
        type: 'error',
        message: 'Number has not been called yet'
      });
      return;
    }

    // Mark the cell
    const cellKey = `${cardIndex}:${row}:${col}`;
    player.markedCells.add(cellKey);

    this.broadcast({
      type: 'cell_marked',
      playerId,
      cardIndex,
      row,
      col
    });

    // Check for win
    if (hasWinningRow(player.cards, player.markedCells)) {
      player.hasWon = true;
      this.state.winner = playerId;
      this.state.status = 'completed';

      this.broadcast({
        type: 'player_won',
        playerId,
        playerName: player.name
      });

      this.broadcast({
        type: 'game_ended',
        winner: player.name
      });
    }
  }

  private broadcast(message: LotoServerMessage, excludePlayerId?: string): void {
    for (const [playerId, ws] of this.sessions.entries()) {
      if (excludePlayerId && playerId === excludePlayerId) continue;
      this.sendToWebSocket(ws, message);
    }
  }

  private sendToWebSocket(ws: WebSocket, message: LotoServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  private sendRoomState(ws: WebSocket): void {
    const players = Array.from(this.state.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      markedCount: p.markedCells.size,
      hasWon: p.hasWon
    }));

    this.sendToWebSocket(ws, {
      type: 'room_state',
      state: {
        id: this.state.id,
        status: this.state.status,
        players,
        calledNumbers: this.state.calledNumbers,
        currentNumber: this.state.currentNumber,
        winner: this.state.winner,
        hostId: this.state.hostId
      }
    });
  }

  private getPlayerIdByWebSocket(ws: WebSocket): string | null {
    for (const [playerId, session] of this.sessions.entries()) {
      if (session === ws) return playerId;
    }
    return null;
  }
}
