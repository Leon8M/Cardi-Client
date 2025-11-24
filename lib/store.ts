import { create } from 'zustand';
import { persist } from './zustand-middleware';

// From backend models
export interface Card {
  id: string;
  suit: string;
  value: string;
}

export interface Player {
  id: string;
  username: string;
  hand: Card[];
  wins: number;
  hasCalledCardi: boolean;
}

export interface GameState {
  roomCode: string;
  roomOwnerId: string;
  players: Player[];
  topCard: Card | null;
  currentPlayerIndex: number;
  isReversed: boolean;
  started: boolean;
  message: string;
  drawPenalty: number;
  playerHasTakenAction: boolean;
  questionActive: boolean;
  activeSuit: string | null;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Event types from the backend
export enum EventType {
  GAME_START = 'GAME_START',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  PLAYER_RECONNECTED = 'PLAYER_RECONNECTED',
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DRAWN = 'CARD_DRAWN',
  TURN_PASSED = 'TURN_PASSED',
  CARDI_CALLED = 'CARDI_CALLED',
  GAME_WIN = 'GAME_WIN',
  ERROR = 'ERROR',
  GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
  ROOM_UPDATE = 'ROOM_UPDATE'
}

export interface GameEvent {
  type: EventType;
  payload: any;
}

export interface PlayerJoinedPayload {
  username: string;
}

export interface PlayerReconnectedPayload {
  username: string;
}

export interface PlayerLeftPayload {
  username: string;
}

export interface CardPlayedPayload {
  playerId: string;
  cards: Card[];
}

export interface CardDrawnPayload {
  playerId: string;
  numberOfCards: number;
}

export interface TurnPassedPayload {
  playerId: string;
}

export interface CardiCalledPayload {
  playerId: string;
}

export interface GameWinPayload {
  winnerUsername: string;
}


interface GameStore {
  // Persisted state
  username: string;
  playerId: string | null;
  
  // Transient state
  gameState: GameState | null;
  connectionStatus: ConnectionStatus;
  
  // Actions
  setUsername: (username: string) => void;
  setPlayerId: (playerId: string) => void;
  setGameState: (gameState: GameState, message?: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  handlePlayerJoined: (payload: PlayerJoinedPayload) => void;
  handlePlayerReconnected: (payload: PlayerReconnectedPayload) => void;
  handlePlayerLeft: (payload: PlayerLeftPayload) => void;
  handleCardPlayed: (payload: CardPlayedPayload) => void;
  handleCardDrawn: (payload: CardDrawnPayload) => void;
  handleTurnPassed: (payload: TurnPassedPayload) => void;
  handleCardiCalled: (payload: CardiCalledPayload) => void;
  handleGameWin: (payload: GameWinPayload) => void;
  
  // Utility getters
  myPlayer: () => Player | undefined;
  isMyTurn: () => boolean;

  // Reset
  reset: () => void;
}

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  // Persisted state
  username: '',
  playerId: null,
  
  // Transient state
  gameState: null,
  connectionStatus: 'disconnected',

  // Actions
  setUsername: (username) => set({ username }),
  setPlayerId: (playerId) => set({ playerId }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setGameState: (gameState, message) => {
    const oldGameState = get().gameState;
    if (message) {
      gameState.message = message;
    }
    // Persist hand across updates where the server might not send it
    if (oldGameState && gameState) {
      const oldMe = oldGameState.players.find(p => p.id === get().playerId);
      const newMe = gameState.players.find(p => p.id === get().playerId);
      if (oldMe && newMe && newMe.hand.length === 0) {
        newMe.hand = oldMe.hand;
      }
    }
        set({ gameState });
  },

  handlePlayerJoined: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    newGameState.message = `${payload.username} has joined the room.`;
    set({ gameState: newGameState });
  },

  handlePlayerReconnected: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    newGameState.message = `${payload.username} has reconnected.`;
    set({ gameState: newGameState });
  },

  handlePlayerLeft: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    newGameState.message = `${payload.username} has left the room.`;
    set({ gameState: newGameState });
  },

  handleCardPlayed: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    const player = newGameState.players.find(p => p.id === payload.playerId);
    if (player) {
      player.hand = player.hand.filter(card => !payload.cards.some(c => c.suit === card.suit && c.value === card.value));
      newGameState.message = `${player.username} played ${payload.cards.length} card(s).`;
    }
    set({ gameState: newGameState });
  },

  handleCardDrawn: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    const player = newGameState.players.find(p => p.id === payload.playerId);
    if (player) {
      // We don't know the cards, so we can't add them to the hand.
      // The GAME_STATE_UPDATE will sync the hand.
      newGameState.message = `${player.username} drew ${payload.numberOfCards} card(s).`;
    }
    set({ gameState: newGameState });
  },

  handleTurnPassed: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    const player = newGameState.players.find(p => p.id === payload.playerId);
    if (player) {
      newGameState.message = `${player.username} passed the turn.`;
    }
    set({ gameState: newGameState });
  },

  handleCardiCalled: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState };
    const player = newGameState.players.find(p => p.id === payload.playerId);
    if (player) {
      player.hasCalledCardi = true;
      newGameState.message = `${player.username} has called CARDI!`;
    }
    set({ gameState: newGameState });
  },

  handleGameWin: (payload) => {
    const { gameState } = get();
    if (!gameState) return;
    const newGameState = { ...gameState, started: false };
    newGameState.message = `${payload.winnerUsername} has won the game!`;
    set({ gameState: newGameState });
  },

  // Getters
  myPlayer: () => {
    const { gameState, playerId } = get();
    if (!gameState || !playerId) return undefined;
    return gameState.players.find((p) => p.id === playerId);
  },
  isMyTurn: () => {
    const { gameState, playerId } = get();
    if (!gameState || !playerId || !gameState.started) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.id === playerId;
  },

  // Reset
  reset: () => set({
    username: get().username, // Keep username on reset
    playerId: null,
    gameState: null,
    connectionStatus: 'disconnected',
  }),
}), { name: 'cardi-game-storage' }));

