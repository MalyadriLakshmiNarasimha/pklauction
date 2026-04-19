import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, SkipForward, Flag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../shared/GlassCard';

export default function HostControls({ paused, onPause, onSkip, onEndRound }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pkl-yellow" />
            <span className="text-xs font-semibold text-pkl-yellow uppercase tracking-wider">Host Controls</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onPause}
              size="sm"
              variant="outline"
              className={`gap-1.5 h-8 text-xs border-border/60 ${paused ? 'text-pkl-green border-pkl-green/30 bg-pkl-green/10' : 'text-muted-foreground'}`}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              onClick={onSkip}
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-border/60 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </Button>
            <Button
              onClick={onEndRound}
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <Flag className="w-3.5 h-3.5" />
              End Round
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}