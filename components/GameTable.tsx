"use client";

import { useGameStore } from "@/lib/store";
import { PlayerSeat } from "./PlayerSeat";
import { Deck } from "./Deck";

export function GameTable() {
  const { gameState, myPlayer } = useGameStore();
  const players = gameState?.players ?? [];
  const me = myPlayer();
  const otherPlayers = players.filter(p => p.id !== me?.id);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top container for other players, responsive */}
      <div className="flex flex-col md:flex-row justify-center items-center md:gap-4 p-2 md:p-4 overflow-y-auto">
        {otherPlayers.map((player) => (
          <PlayerSeat key={player.id} player={player} />
        ))}
      </div>

      {/* Center area for deck and discard */}
      <div className="flex-grow flex items-center justify-center">
        <Deck />
      </div>
    </div>
  );
}
