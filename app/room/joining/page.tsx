'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export default function JoiningRoomPage() {
  const router = useRouter();
  const { gameState } = useGameStore();

  useEffect(() => {
    if (gameState?.roomCode) {
      router.push(`/room/${gameState.roomCode}`);
    }
  }, [gameState, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Joining Room...</h1>
        <p className="text-muted-foreground">Please wait while we connect you to the room.</p>
      </div>
    </div>
  );
}
