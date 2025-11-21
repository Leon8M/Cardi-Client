"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spade, Heart, Diamond, Club } from "lucide-react";

interface AceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuit: (suit: string) => void;
}

const suits = [
  { name: "Hearts", icon: <Heart className="w-8 h-8" />, color: "text-primary" },
  { name: "Diamonds", icon: <Diamond className="w-8 h-8" />, color: "text-primary" },
  { name: "Clubs", icon: <Club className="w-8 h-8" />, color: "text-foreground" },
  { name: "Spades", icon: <Spade className="w-8 h-8" />, color: "text-foreground" },
];

export function AceModal({ isOpen, onClose, onSelectSuit }: AceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a Suit</DialogTitle>
          <DialogDescription>
            You played an Ace. Select the suit you want to change to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {suits.map((suit) => (
            <Button
              key={suit.name}
              variant="outline"
              className={`flex flex-col h-24 items-center justify-center gap-2 ${suit.color}`}
              onClick={() => onSelectSuit(suit.name)}
            >
              {suit.icon}
              <span className="text-lg font-semibold">{suit.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
