"use client";

import { Card as CardType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Spade, Heart, Diamond, Club } from "lucide-react";
import { motion } from "framer-motion";

interface CardProps {
  card: CardType | null;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const suitIcons = {
  "Spades": <Spade className="w-full h-full" />,
  "Hearts": <Heart className="w-full h-full" />,
  "Diamonds": <Diamond className="w-full h-full" />,
  "Clubs": <Club className="w-full h-full" />,
  "Joker": "🃏",
};

export function GameCard({ card, className, onClick, isSelected }: CardProps) {
  const cardVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };
  
  const Comp = motion.div;

  if (!card) {
    // Render a card back
    return (
      <Comp
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "w-20 h-28 bg-secondary rounded-lg border-2 border-background shadow-lg",
          "flex items-center justify-center",
          className
        )}
      >
        <div className="w-12 h-12 text-primary">
            <Spade/>
        </div>
      </Comp>
    );
  }

  const isRed = card.suit === "Hearts" || card.suit === "Diamonds";
  const suitIcon = suitIcons[card.suit as keyof typeof suitIcons] ?? "？";

  return (
    <Comp
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout
      className={cn(
        "w-20 h-28 bg-card rounded-lg p-2 flex flex-col justify-between shadow-md relative",
        "border-2 border-transparent",
        isRed ? "text-primary" : "text-foreground",
        isSelected && "ring-2 ring-offset-2 ring-offset-background ring-accent",
        onClick && "cursor-pointer hover:-translate-y-2 transition-transform",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-start">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold leading-none">{card.value}</span>
          <div className="w-4 h-4">{suitIcon}</div>
        </div>
      </div>
      <div className="flex items-center justify-center text-4xl">
        {suitIcon}
      </div>
      <div className="flex justify-end">
        <div className="flex flex-col items-center rotate-180">
          <span className="text-xl font-bold leading-none">{card.value}</span>
          <div className="w-4 h-4">{suitIcon}</div>
        </div>
      </div>
    </Comp>
  );
}
