import { create } from 'zustand';
import { persist } from './zustand-middleware';

// From backend models
export interface Card {
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
  setGameState: (gameState: GameState) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  
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
  setGameState: (gameState) => {
    const oldGameState = get().gameState;
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

