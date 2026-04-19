import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ParticipantsList({ participants }) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {participants.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: p.color || '#009B4D' }}
            >
              {p.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">{p.email}</p>
            </div>
            {p.isAdmin && (
              <Badge className="bg-pkl-yellow/15 text-pkl-yellow border-pkl-yellow/30 text-xs gap-1">
                <Crown className="w-3 h-3" /> Admin
              </Badge>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}