"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { stompManager } from '@/lib/ws-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function Lobby() {
  const router = useRouter();
  const { username, setUsername, gameState, connectionStatus } = useGameStore();
  const [localRoomCode, setLocalRoomCode] = useState('');

  useEffect(() => {
    if (gameState?.roomCode) {
      router.push(`/room/${gameState.roomCode}`);
    }
  }, [gameState, router]);
  
  const handleCreateRoom = () => {
    if (username.trim()) {
      stompManager.connect();
      // Wait for connection to be established
      setTimeout(() => {
          stompManager.send('/app/room.create', { username });
      }, 500)
    } else {
      alert('Please enter a username.');
    }
  };

  const handleJoinRoom = () => {
    if (username.trim() && localRoomCode.trim()) {
      stompManager.connect();
      // Wait for connection to be established
      setTimeout(() => {
        stompManager.send('/app/room.join', { username, roomCode: localRoomCode });
      }, 500)
    } else {
      alert('Please enter a username and room code.');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Game Lobby</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-input"
          />
        </div>
        
        <Button onClick={handleCreateRoom} className="w-full" disabled={connectionStatus === 'connecting'}>
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Create New Room'}
        </Button>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or join a room
                </span>
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomCode">Room Code</Label>
          <Input
            id="roomCode"
            placeholder="Enter room code"
            value={localRoomCode}
            onChange={(e) => setLocalRoomCode(e.target.value.toUpperCase())}
            className="bg-input"
          />
        </div>
        <Button onClick={handleJoinRoom} className="w-full" variant="secondary" disabled={connectionStatus === 'connecting'}>
          Join Room
        </Button>
      </CardContent>
    </Card>
  );
}
