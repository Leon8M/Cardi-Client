"use client";

import { useGameStore } from "@/lib/store";
import { PlayerSeat } from "./PlayerSeat";
import { Deck } from "./Deck";
import { Hand } from "./Hand";

export function GameTable() {
  const { gameState, myPlayer } = useGameStore();
  const players = gameState?.players ?? [];
  const me = myPlayer();
  const otherPlayers = players.filter(p => p.id !== me?.id);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top container for other players, responsive */}
      <div className="flex flex-row justify-center items-center gap-4 p-4 overflow-y-auto">
        {otherPlayers.map((player) => (
          <PlayerSeat key={player.id} player={player} />
        ))}
      </div>

      {/* Center area for deck and discard */}
      <div className="flex-grow flex items-center justify-center">
        <Deck />
      </div>
      
      {/* Hand container */}
      <div className="h-56 md:h-64">
        {me && gameState && gameState.started && <Hand />}
      </div>
    </div>
  );
}
