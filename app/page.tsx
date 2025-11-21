"use client";

import { Lobby } from "@/components/Lobby";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-8 text-center">
        <h1 className="text-5xl font-bold text-primary">Cardi!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The multiplayer card game.
        </p>
      </div>
      <Lobby />
    </main>
  );
}
