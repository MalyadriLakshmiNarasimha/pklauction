import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoundBanner({ round, playerIndex, totalPlayers }) {
  const isUnsold = round === 'unsold';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={round}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border',
              isUnsold
                ? 'bg-pkl-yellow/10 border-pkl-yellow/30 text-pkl-yellow'
                : 'bg-pkl-green/10 border-pkl-green/30 text-pkl-green'
            )}
          >
            {isUnsold && <RotateCcw className="w-4 h-4" />}
            <span className="text-sm font-bold uppercase tracking-wider">
              {isUnsold ? 'Unsold Players Round' : 'Normal Round'}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-sm text-muted-foreground">
        Player {playerIndex + 1} of {totalPlayers}
      </span>
    </div>
  );
}