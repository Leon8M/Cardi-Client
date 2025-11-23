"use client";

import { useGameStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";

export function GameMessage() {
  const { gameState } = useGameStore();

  const message = gameState?.message;
  const isWinMessage = message?.toLowerCase().includes("won");

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`fixed top-4 right-4 p-2 sm:p-4 rounded-lg shadow-lg text-white text-base sm:text-xl font-bold z-50 ${
            isWinMessage ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
