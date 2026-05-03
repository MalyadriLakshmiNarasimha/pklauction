import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, TrendingUp, ChevronDown, Home, Star,
  Wallet, Users, AlertCircle, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../components/shared/GlassCard';
import { Progress } from '@/components/ui/progress';
import { cn, formatBasePrice } from '@/lib/utils';

function ExpandableTeam({ team, rank }) {
  const [expanded, setExpanded] = useState(false);
  const spent = team.purse - team.remaining;
  const efficiency = team.players.length > 0 && spent > 0
    ? (team.players.length / spent * 10).toFixed(1)
    : '0.0';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.08 }}>
      <GlassCard className={cn(rank === 0 && 'glow-yellow border-pkl-yellow/30')}>
        <button onClick={() => setExpanded(e => !e)} className="w-full text-left">
          <div className="flex items-center gap-4">
            {/* Rank badge */}
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0',
              rank === 0 ? 'bg-pkl-yellow text-pkl-dark'
                : rank === 1 ? 'bg-gray-300 text-gray-800'
                  : rank === 2 ? 'bg-orange-400 text-white'
                    : 'bg-muted text-muted-foreground'
            )}>
              {rank + 1}
            </div>

            {/* Team avatar */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: team.color || '#009B4D' }}
            >
              {(team.name || '?')[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{team.name}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> ₹{(team.remaining ?? 0).toFixed(1)} Cr left
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {team.players.length} players
                </span>
              </div>
            </div>

            {rank === 0 && <Trophy className="w-6 h-6 text-pkl-yellow flex-shrink-0" />}
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform flex-shrink-0', expanded && 'rotate-180')} />
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                {team.players.length > 0 ? (
                  <div className="space-y-1.5">
                    {team.players.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                        <div>
                          <span className="text-sm text-foreground">{p.name}</span>
                          {p.role && <span className="text-xs text-muted-foreground ml-2">({p.role})</span>}
                        </div>
                        <span className="text-sm font-bold text-pkl-yellow">₹{(p.price ?? 0).toFixed(2)} Cr</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">No players acquired</p>
                )}

                {spent > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Purse Used</span>
                      <span className="text-foreground">{((spent / team.purse) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(spent / team.purse) * 100} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Efficiency Score</span>
                      <span className="text-pkl-green">{efficiency}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

export default function Results() {
  const { roomCode } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`pkl_result_${roomCode}`);
      if (raw) setResult(JSON.parse(raw));
    } catch (_) {}
    setLoading(false);
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pkl-green/30 border-t-pkl-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard className="max-w-md w-full text-center py-14 px-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="font-cardo text-2xl font-bold text-foreground mb-3">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            Results for room <span className="font-mono text-pkl-green">{roomCode}</span> are not available.
            Complete an auction first.
          </p>
          <Link to="/lobby">
            <Button className="bg-pkl-green hover:bg-pkl-green/90 text-white rounded-xl">
              Back to Lobby
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Sort teams by players bought (desc), then purse spent (desc)
  const sortedTeams = [...result.teams].sort((a, b) => {
    if (b.players.length !== a.players.length) return b.players.length - a.players.length;
    const spentA = a.purse - a.remaining;
    const spentB = b.purse - b.remaining;
    return spentB - spentA;
  });

  // Compute awards from actual data
  const allSold = result.soldPlayers || [];
  const mostExpensive = allSold.length > 0
    ? allSold.reduce((best, p) => (p.soldPrice > best.soldPrice ? p : best), allSold[0])
    : null;
  const bestValue = allSold.length > 0
    ? allSold.reduce((best, p) => ((p.stats?.points || 0) / p.soldPrice > (best.stats?.points || 0) / best.soldPrice ? p : best), allSold[0])
    : null;

  const awards = [
    mostExpensive && {
      icon: TrendingUp,
      label: 'Most Expensive',
      value: mostExpensive.name,
      sub: `₹${mostExpensive.soldPrice.toFixed(2)} Cr — ${mostExpensive.soldToName}`,
      color: 'text-pkl-yellow',
    },
    bestValue && {
      icon: Star,
      label: 'Best Value Pick',
      value: bestValue.name,
      sub: `₹${bestValue.soldPrice.toFixed(2)} Cr — ${bestValue.soldToName}`,
      color: 'text-pkl-green',
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pkl-yellow to-pkl-yellow/60 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-pkl-dark" />
          </div>
          <h1 className="font-cardo text-4xl sm:text-5xl font-bold text-foreground">Auction Complete</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">Room: {roomCode}</p>
        </motion.div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Teams', value: result.teams.length, color: 'text-pkl-green' },
            { label: 'Sold Players', value: allSold.length, color: 'text-pkl-yellow' },
            { label: 'Unsold', value: result.unsoldPlayers?.length || 0, color: 'text-destructive' },
            { label: 'Total Spent', value: `₹${allSold.reduce((s, p) => s + p.soldPrice, 0).toFixed(0)} Cr`, color: 'text-purple-400' },
          ].map((s, i) => (
            <GlassCard key={i} className="text-center py-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Awards */}
        {awards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {awards.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <GlassCard className="text-center py-5">
                  <a.icon className={`w-7 h-7 mx-auto mb-2 ${a.color}`} />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{a.label}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{a.value}</p>
                  <p className="text-sm text-muted-foreground">{a.sub}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3 mb-8">
          {sortedTeams.map((team, i) => (
            <ExpandableTeam key={team.id} team={team} rank={i} />
          ))}
        </div>

        {/* Unsold players list */}
        {result.unsoldPlayers?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Unsold Players ({result.unsoldPlayers.length})</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.unsoldPlayers.map((p, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-muted/20 text-xs">
                    <span className="text-foreground font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2">{formatBasePrice(p.basePrice)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/previous-auctions">
            <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl">
              <Trophy className="w-4 h-4" /> View History
            </Button>
          </Link>
          <Link to="/">
            <Button className="gap-2 h-12 px-6 bg-pkl-green hover:bg-pkl-green/90 text-white rounded-xl">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}