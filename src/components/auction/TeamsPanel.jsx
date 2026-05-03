import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Wallet, Users, Crown } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import AnimatedNumber from '../shared/AnimatedNumber';
import { cn } from '@/lib/utils';

function TeamCard({ team, isCurrentUser, maxSquad, defaultPurse }) {
  const [expanded, setExpanded] = useState(false);
  const playerCount = team.players?.length || 0;
  const spent = team.players?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isCurrentUser ? 'border-pkl-green/40 bg-pkl-green/5' : 'border-border/50 bg-muted/20',
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: team.color || '#009B4D' }}
        >
          {team.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
            {isCurrentUser && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-pkl-green/20 text-pkl-green font-medium">You</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              <AnimatedNumber value={team.purse} prefix="₹" suffix=" L" className="text-pkl-green font-medium" />
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {playerCount}/{maxSquad}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
            expanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/30 pt-2">
              {team.players?.length > 0 ? (
                <div className="space-y-1.5">
                  {team.players.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/20">
                      <span className="text-xs text-foreground">{p.name}</span>
                      <span className="text-xs font-medium text-pkl-yellow">₹{p.price} L</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">Total Spent</span>
                    <span className="text-xs font-bold text-pkl-green">₹{spent.toFixed(2)} L</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">No players yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeamPanel({ teams, currentUserId, maxSquad, defaultPurse }) {
  const teamList = Object.values(teams);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Crown className="w-4 h-4 text-pkl-yellow" /> Teams
        </h3>
        <span className="text-xs text-muted-foreground">{teamList.length} teams</span>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {teamList.map(team => (
          <TeamCard
            key={team.id}
            team={team}
            isCurrentUser={team.id === currentUserId}
            maxSquad={maxSquad}
            defaultPurse={defaultPurse}
          />
        ))}
      </div>
    </GlassCard>
  );
}