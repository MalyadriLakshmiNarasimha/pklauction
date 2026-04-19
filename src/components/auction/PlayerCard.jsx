import React from 'react';
import { motion } from 'framer-motion';
import RoleBadge from '../shared/RoleBadge';
import GlassCard from '../shared/GlassCard';

export default function PlayerCard({ player, status }) {
  if (!player) return null;

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <GlassCard className="relative overflow-hidden" glow={status === 'sold' ? 'green' : undefined}>
        {/* Sold/Unsold overlay */}
        {status === 'sold' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-pkl-green/10 z-10 flex items-center justify-center"
          >
            <span className="text-4xl font-cardo font-bold text-pkl-green drop-shadow-lg">SOLD!</span>
          </motion.div>
        )}
        {status === 'unsold' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-destructive/10 z-10 flex items-center justify-center"
          >
            <span className="text-4xl font-cardo font-bold text-destructive drop-shadow-lg">UNSOLD</span>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Player image */}
          <div className="relative w-full sm:w-40 h-48 sm:h-52 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0">
            <img
              src={player.image}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              style={{ objectPosition: 'center 20%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <RoleBadge role={player.role} />
            </div>
          </div>

          {/* Player info */}
          <div className="flex-1 min-w-0 py-1">
            <h2 className="font-cardo text-2xl sm:text-3xl font-bold text-foreground leading-tight">{player.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{player.team}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Base Price</span>
              <span className="text-lg font-bold text-pkl-yellow">₹{player.basePrice} Cr</span>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Raids', value: player.stats?.raids || 0 },
                { label: 'Points', value: player.stats?.points || 0 },
                { label: 'Matches', value: player.stats?.matches || 0 },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}