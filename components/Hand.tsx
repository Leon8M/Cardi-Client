"use client";

import { useState, useEffect } from 'react';
import { useGameStore, Card } from '@/lib/store';
import { GameCard } from './Card';
import { Button } from './ui/button';
import { stompManager } from '@/lib/ws-client';
import { AceModal } from './AceModal';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerSeat } from './PlayerSeat';

export function Hand() {
  const { myPlayer, isMyTurn, playerId, gameState } = useGameStore();
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isAceModalOpen, setAceModalOpen] = useState(false);
  const [spread, setSpread] = useState(30);

  const me = myPlayer();
  const hand = me?.hand ?? [];
  const roomCode = gameState?.roomCode;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSpread(20);
      } else {
        setSpread(30);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCardClick = (card: Card) => {
    setSelectedCards((prev) => {
      const isAlreadySelected = prev.find(c => c.id === card.id);

      if (isAlreadySelected) {
        return prev.filter(c => c.id !== card.id);
      }

      // If nothing is selected yet, just select the card.
      if (prev.length === 0) {
        return [card];
      }

      const firstSelected = prev[0];

      // Standard multi-select: same value
      if (firstSelected.value === card.value) {
        return [...prev, card];
      }
      
      // Special multi-select: 8s and Qs of the same suit
      const isCardQuestion = card.value === '8' || card.value === 'Q';
      const areAllSelectedQuestions = prev.every(c => c.value === '8' || c.value === 'Q');

      if (isCardQuestion && areAllSelectedQuestions && firstSelected.suit === card.suit) {
        return [...prev, card];
      }

      // If no multi-select rule matches, reset selection to the new card
      return [card];
    });
  };
  
  useEffect(() => {
    const isAcePlay = selectedCards.some(c => c.value === 'A');
    const isCounterPlay = gameState?.drawPenalty && gameState.drawPenalty > 0;
    if (isAcePlay && !isCounterPlay) {
      setAceModalOpen(true);
    }
  }, [selectedCards, gameState?.drawPenalty]);

  const handlePlay = (suit?: string) => {
    if (selectedCards.length > 0 && playerId && roomCode) {
      const isAce = selectedCards.some(c => c.value === 'A');
      if (isAce && !suit) {
        setAceModalOpen(true);
        return;
      }
      
      stompManager.send('/app/game.play', {
        roomCode,
        playerId,
        cards: selectedCards,
        newSuit: suit || null,
      });

      setSelectedCards([]);
      setAceModalOpen(false);
    }
  };
  
    const handleDraw = () => {
        if (playerId && roomCode) {
            stompManager.send('/app/game.draw', { roomCode, playerId });
        }
    };

    const handlePass = () => {
        if (playerId && roomCode) {
            stompManager.send('/app/game.pass', { roomCode, playerId });
        }
    };
    
    const handleCallCardi = () => {
        if (playerId && roomCode) {
            stompManager.send('/app/game.callCardi', { roomCode, playerId });
        }
    }
    
  const handleSelectSuit = (suit: string) => {
    handlePlay(suit);
  };

  if (!me) return null;

  return (
    <>
      <AceModal 
        isOpen={isAceModalOpen}
        onClose={() => setAceModalOpen(false)}
        onSelectSuit={handleSelectSuit}
      />
      <div className="absolute bottom-0 left-0 right-0 h-56 flex flex-col items-center justify-end">
          <div className="flex-grow flex justify-center items-end relative w-full">
            <AnimatePresence>
              {hand.map((card, index) => (
              <motion.div
                  key={card.id}
                  layoutId={card.id}
                  layout
                  className="absolute"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: isSelected(card) ? -20 : 0,
                    x: (index - hand.length / 2) * spread,
                    rotate: (index - hand.length / 2) * 5
                  }}
                  exit={{ opacity: 0, y: 50, x: (index - hand.length / 2) * spread }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    transformOrigin: 'bottom center',
                  }}
              >
                  <GameCard
                    card={card}
                    onClick={() => handleCardClick(card)}
                    isSelected={isSelected(card)}
                  />
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="p-2 bg-background/80 backdrop-blur-sm rounded-t-lg w-full flex items-center justify-center gap-2 md:gap-4">
            <PlayerSeat player={me} />
            <div className="flex gap-2">
                <Button size="sm" onClick={() => handlePlay()} disabled={!isMyTurn() || selectedCards.length === 0 || gameState?.playerHasTakenAction}>Play</Button>
                <Button size="sm" onClick={handleDraw} disabled={!isMyTurn() || gameState?.playerHasTakenAction} variant="secondary">
                  {gameState?.drawPenalty && gameState.drawPenalty > 0 ? `Accept Penalty (${gameState.drawPenalty} cards)` : 'Draw'}
                </Button>
                <Button size="sm" onClick={handlePass} disabled={!isMyTurn() || !gameState?.playerHasTakenAction} variant="secondary">Pass</Button>
                <Button size="sm" onClick={handleCallCardi} disabled={!isMyTurn() || myPlayer()?.hasCalledCardi} variant="ghost" className="text-primary">Cardi!</Button>
            </div>
          </div>
      </div>
    </>
  );

  function isSelected(card: Card) {
    return selectedCards.some(c => c.id === card.id);
  }
}
