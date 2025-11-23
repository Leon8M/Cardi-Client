"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export function TutorialModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">How to Play</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Play Cardi!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">Objective</h3>
            <p>
              The goal is to be the first player to get rid of all your cards.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Getting Started</h3>
            <ul className="list-disc list-inside">
              <li>Enter your username.</li>
              <li>
                One player creates a room and will get a room code.
              </li>
              <li>Share the code with your friends.</li>
              <li>
                Other players can join the room by entering the room code.
              </li>
              <li>The player who created the room can start the game.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Gameplay</h3>
            <ul className="list-disc list-inside">
              <li>Each player starts with 4 cards.</li>
              <li>
                On your turn, you must play a card that matches the top card of
                the discard pile in either suit or value.
              </li>
              <li>
                If you don&apos;t have a playable card, you must draw one from
                the deck.
              </li>
              <li>
                You can play multiple cards of the same value at once.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Special Cards</h3>
            <ul className="list-disc list-inside">
              <li>
                <strong>2, 3, Joker:</strong> The next player must draw 2, 3, or
                5 cards, respectively. This can be stacked.
              </li>
              <li>
                <strong>J (Jump):</strong> Skips the next player.
              </li>
              <li>
                <strong>K (Kickback):</strong> Reverses the direction of play.
              </li>
              <li>
                <strong>Q / 8 (Question):</strong> The next player must play a
                card of the same suit. If they can&apos;t, they draw a card.
              </li>
              <li>
                <strong>A (Ace):</strong> A wild card that lets you change the
                suit.
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: You cannot win the game by playing a special card (2, 3, J, K, 8, Q, Joker, or A).
            </p>
          </div>
          <div>
            <h3 className="font-bold">Winning</h3>
            <p>
              Once a player has only one card left, they can call &quot;Cardi!&quot; to
              declare their intent to win on the next turn. The first player to
              play their last card wins the round!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
