"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";

export function GameMessage() {
  const { gameState } = useGameStore();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  const message = gameState?.message;

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      const timer = setTimeout(() => {
        setDisplayMessage(null);
      }, 2000); // Display for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [message]); // Re-run effect when gameState.message changes

  const isWinMessage = displayMessage?.toLowerCase().includes("won");

  return (
    <AnimatePresence>
      {displayMessage && (
        <motion.div
          key={displayMessage} // Use displayMessage for key to trigger animation on new messages
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`fixed top-4 right-4 p-2 sm:p-4 rounded-lg shadow-lg text-white text-base sm:text-xl font-bold z-50 ${
            isWinMessage ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {displayMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
