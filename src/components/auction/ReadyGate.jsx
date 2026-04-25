import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../shared/GlassCard';
import { cn } from '@/lib/utils';

export default function ReadyGate({ participants, currentUserId, isReady, squadFull, onReady }) {
  const readyCount = participants.filter(p => p.isReady).length;
  const total = participants.length;
  const allReady = readyCount === total && total > 0;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-pkl-green" />
          <h3 className="text-sm font-semibold text-foreground">Ready Check</h3>
        </div>
        <span className="text-xs text-muted-foreground">{readyCount}/{total} ready</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-pkl-green rounded-full"
          animate={{ width: total ? `${(readyCount / total) * 100}%` : '0%' }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Participants */}
      <div className="space-y-1.5">
        {participants.map(p => (
          <div key={p.id} className="flex items-center gap-2.5 py-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: p.color || '#009B4D' }}
            >
              {p.name?.[0]?.toUpperCase()}
            </div>
            <span className={cn('text-xs flex-1', p.id === currentUserId ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {p.name} {p.id === currentUserId && '(You)'}
            </span>
            {p.isReady
              ? <CheckCircle2 className="w-4 h-4 text-pkl-green" />
              : <Clock className="w-4 h-4 text-muted-foreground/50" />
            }
          </div>
        ))}
      </div>

      {/* Ready button */}
      {!isReady && (
        <Button
          onClick={onReady}
          className="w-full h-10 bg-pkl-green hover:bg-pkl-green/90 text-white font-semibold rounded-xl"
        >
          {squadFull ? '✅ Squad Full — Ready!' : 'Mark as Ready'}
        </Button>
      )}

      {isReady && !allReady && (
        <div className="text-center py-2 text-sm text-pkl-green font-medium">
          ✅ You're ready — waiting for others…
        </div>
      )}

      {allReady && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-2 text-sm text-pkl-yellow font-bold"
        >
          🚀 All ready — moving to next phase!
        </motion.div>
      )}
    </GlassCard>
  );
}