import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BidTimer({ timer, maxTime, paused = false }) {
  const pct = (timer / maxTime) * 100;
  const isCritical = timer <= 5 && !paused;
  const isWarning = timer <= 10 && !paused;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {paused ? '⏸ PAUSED' : 'TIME REMAINING'}
        </span>
        <span
          className={cn(
            'text-3xl font-mono font-bold tabular-nums',
            paused ? 'text-muted-foreground' : isCritical ? 'text-destructive timer-critical' : isWarning ? 'text-pkl-yellow' : 'text-foreground'
          )}
        >
          {timer}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors',
            paused ? 'bg-muted-foreground/40' : isCritical ? 'bg-destructive' : isWarning ? 'bg-pkl-yellow' : 'bg-pkl-green'
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
    </div>
  );
}