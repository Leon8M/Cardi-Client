'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { stompManager } from '@/lib/ws-client';
import { GameTable } from '@/components/GameTable';
import { Button } from '@/components/ui/button';
import { TurnIndicator } from '@/components/TurnIndicator';
import { GameMessage } from '@/components/GameMessage';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const { gameState, connectionStatus, myPlayer, playerId, username } = useGameStore();

  useEffect(() => {
    if (roomCode && username) {
      stompManager.connect(() => {
        // If we have a playerId, we are rejoining
        if (playerId) {
          stompManager.send('/app/room.rejoin', { roomCode, playerId });
        } else if (!gameState) {
          // If gameState is null, it means we are likely joining for the first time
          stompManager.send('/app/room.join', { username, roomCode });
        }
        // Always subscribe to ensure we get updates
        stompManager.subscribeToRoom(roomCode);
      });
    }
  }, [roomCode, username, playerId]); // Rerun when connection status changes
  
  const handleStartGame = () => {
    if(roomCode) {
        stompManager.send('/app/game.start', { roomCode });
    }
  }

  const me = myPlayer();
  const isOwner = gameState?.roomOwnerId === playerId;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Joining Room: {roomCode}</h1>
            <p className="text-muted-foreground">Waiting for server...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-screen items-center p-2 md:p-4 overflow-hidden">
      <GameMessage />
      <div className="w-full flex-shrink-0 text-center mb-2">
        <div className="flex justify-between items-center">
            <div className="w-24"></div> {/* Spacer */}
            <h1 className="text-lg font-bold text-primary">
              Room: {roomCode}
            </h1>
            <div className="w-24">
                {!gameState.started && isOwner && (
                    <Button size="sm" onClick={handleStartGame}>Start Game</Button>
                )}
            </div>
        </div>
        <TurnIndicator />
      </div>
      
      <div className="flex-1 relative w-full">
        <GameTable />
      </div>
    </main>
  );
}
