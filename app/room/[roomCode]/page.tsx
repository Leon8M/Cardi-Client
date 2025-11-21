'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { stompManager } from '@/lib/ws-client';
import { GameTable } from '@/components/GameTable';
import { Hand } from '@/components/Hand';
import { Button } from '@/components/ui/button';
import { TurnIndicator } from '@/components/TurnIndicator';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const { gameState, connectionStatus, myPlayer, playerId, username } = useGameStore();

  useEffect(() => {
    // This effect handles both initial joining and rejoining on reload
    if (roomCode && username) {
        if (connectionStatus === 'disconnected') {
            stompManager.connect();
        }

        const timeout = setTimeout(() => {
            if (stompManager['isConnected']) {
                // If gameState is null, it means we are likely reloading the page or joining for the first time
                // without an initial private message. Let's try to join.
                if (!gameState) {
                    stompManager.send('/app/room.join', { username, roomCode });
                }
                // Always subscribe to ensure we get updates
                stompManager.subscribeToRoom(roomCode);
            }
        }, 500); // 500ms delay to allow STOMP connection to establish

        return () => clearTimeout(timeout);
    }
  }, [roomCode, username, connectionStatus]); // Rerun when connection status changes
  
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
      
      <div className="flex-shrink relative w-full">
        <GameTable />
      </div>

      <div className="flex-shrink-0 h-56 md:h-64 w-full">
        {me && gameState.started && <Hand />}
      </div>
    </main>
  );
}
