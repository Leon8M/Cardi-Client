"use client";

import { useGameStore } from "@/lib/store";
import { stompManager } from "@/lib/ws-client";
import { GameCard } from "./Card";

export function Deck() {
    const { gameState, isMyTurn, playerId } = useGameStore();
    const roomCode = gameState?.roomCode;

    const handleDrawClick = () => {
        if (isMyTurn() && playerId && roomCode && !gameState?.playerHasTakenAction) {
            stompManager.send('/app/game.draw', { roomCode, playerId });
        }
    };

    return (
        <div className="flex gap-4">
            {/* Draw Pile */}
            <div className="flex flex-col items-center gap-2">
                <GameCard 
                    card={null} // Shows card back
                    onClick={handleDrawClick} 
                    className={isMyTurn() && !gameState?.playerHasTakenAction ? "cursor-pointer" : "cursor-not-allowed"}
                />
                <p className="font-semibold text-muted-foreground">Draw Pile</p>
                {gameState?.drawPenalty && gameState.drawPenalty > 0 && (
                    <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        +{gameState.drawPenalty}
                    </div>
                )}
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center gap-2">
                <GameCard card={gameState?.topCard ?? null} />
                <p className="font-semibold text-muted-foreground">Discard Pile</p>
                {gameState?.activeSuit && (
                    <p className="text-sm font-bold text-accent animate-pulse">
                        Active Suit: {gameState.activeSuit}
                    </p>
                )}
            </div>
        </div>
    );
}
