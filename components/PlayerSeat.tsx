"use client";

import { Player, useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlayerSeatProps {
  player: Player;
}

export function PlayerSeat({ player }: PlayerSeatProps) {
  const { gameState } = useGameStore();
  
  const isCurrentPlayer = gameState?.started && 
                          gameState.currentPlayerIndex >= 0 && 
                          gameState.currentPlayerIndex < gameState.players.length &&
                          gameState.players[gameState.currentPlayerIndex].id === player.id;

  return (
    <motion.div 
      layout
      className={cn(
        "flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300",
        isCurrentPlayer && "ring-2 ring-primary shadow-lg shadow-primary/50"
      )}
    >
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl border-2 border-background">
        {player.username.charAt(0).toUpperCase()}
      </div>
      <div className="text-center">
          <p className="font-semibold">{player.username}</p>
          <p className="text-sm text-muted-foreground">
              {player.hand?.length ?? 0} cards
          </p>
          {player.hasCalledCardi && <p className="text-xs font-bold text-primary animate-pulse">CARDI!</p>}
      </div>
    </motion.div>
  );
}
