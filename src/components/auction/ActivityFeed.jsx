import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, XCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import { cn } from '@/lib/utils';

const iconMap = {
  bid: TrendingUp,
  sold: CheckCircle2,
  unsold: XCircle,
  chat: MessageCircle,
};

const colorMap = {
  bid: 'text-pkl-green',
  sold: 'text-pkl-yellow',
  unsold: 'text-destructive',
  chat: 'text-blue-400',
};

export default function ActivityFeed({ activities }) {
  return (
    <GlassCard className="h-full">
      <h3 className="text-sm font-semibold text-foreground mb-3">Live Activity</h3>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {activities.slice(0, 20).map(a => {
            const Icon = iconMap[a.type] || MessageCircle;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', colorMap[a.type])} />
                <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {activities.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Waiting for activity...</p>
        )}
      </div>
    </GlassCard>
  );
}