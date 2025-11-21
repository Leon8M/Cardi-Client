"use client";

import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TurnIndicator() {
  const { gameState, isMyTurn } = useGameStore();

  if (!gameState || !gameState.started) {
    return <div className="h-6 text-center" />;
  }

  const me = isMyTurn();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  let message = "";
  let className = "text-muted-foreground";

  if (me) {
    if (gameState.drawPenalty > 0) {
      message = `DRAW PENALTY! You must draw ${gameState.drawPenalty} or play a counter.`;
      className = "font-bold text-destructive animate-pulse";
    } else if (gameState.questionActive) {
      message = `QUESTION! You must play a ${gameState.topCard?.suit} or draw.`;
      className = "font-bold text-yellow-500";
    } else {
      message = "It's YOUR turn!";
      className = "font-bold text-green-500";
    }
  } else {
    message = `${currentPlayer.username}'s turn.`;
  }

  return (
    <div className="h-6 text-center">
      <p className={cn("text-lg italic", className)}>{message}</p>
    </div>
  );
}
