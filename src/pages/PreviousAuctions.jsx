import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Clock, Users, ChevronDown, TrendingUp, Medal, Star, Wallet, ExternalLink } from 'lucide-react';
import GlassCard from '../components/shared/GlassCard';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Previous Auctions Page
 * In production: fetch from backend using userId
 * Shape: { userId, roomId, roomName, team, totalPoints, rank, timestamp, players[], purseUsed }
 */

// Empty state when no real data exists yet
function EmptyState({ userName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <h2 className="font-cardo text-2xl font-bold text-foreground mb-3">No Auctions Yet</h2>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {userName ? `Hey ${userName.split(' ')[0]}! ` : ''}Your past auction results will appear here once you participate in or host an auction.
      </p>
    </motion.div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div className="w-9 h-9 rounded-xl bg-pkl-yellow/20 border border-pkl-yellow/40 flex items-center justify-center">
      <Trophy className="w-5 h-5 text-pkl-yellow" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-9 h-9 rounded-xl bg-gray-400/20 border border-gray-400/30 flex items-center justify-center">
      <Medal className="w-5 h-5 text-gray-400" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
      <Medal className="w-5 h-5 text-orange-400" />
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    </div>
  );
}

function AuctionCard({ auction, index }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(auction.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <GlassCard className={cn('transition-all duration-300', auction.rank === 1 && 'border-pkl-yellow/20 glow-yellow')}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setExpanded(!expanded)} className="flex-1 text-left" />
          <Link
            to={`/results/${auction.roomId}`}
            className="text-xs text-pkl-green hover:underline flex items-center gap-1 flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" /> Full Results
          </Link>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-4">
            <RankBadge rank={auction.rank} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground truncate">{auction.roomName}</h3>
                {auction.rank === 1 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pkl-yellow/15 text-pkl-yellow border border-pkl-yellow/30 font-medium">
                    Winner
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(date, 'dd MMM yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(date, 'hh:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {auction.totalParticipants} participants
                </span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-pkl-green">{auction.players?.length || 0} players</div>
              <div className="text-xs text-muted-foreground">₹{auction.purseUsed} Cr spent</div>
            </div>

            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform flex-shrink-0', expanded && 'rotate-180')} />
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
              <div className="mt-4 pt-4 border-t border-border/30">
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: TrendingUp, label: 'Points', value: auction.totalPoints, color: 'text-pkl-green' },
                    { icon: Trophy, label: 'Rank', value: `#${auction.rank}`, color: 'text-pkl-yellow' },
                    { icon: Users, label: 'Players', value: auction.players?.length || 0, color: 'text-blue-400' },
                    { icon: Wallet, label: 'Spent', value: `₹${auction.purseUsed} Cr`, color: 'text-purple-400' },
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                      <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                      <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Player list */}
                {auction.players?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team Summary</p>
                    <div className="space-y-1.5">
                      {auction.players.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/20">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${p.role === 'Raider' ? 'bg-pkl-green' : p.role === 'Defender' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                            <span className="text-xs text-foreground truncate">{p.name}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">({p.role})</span>
                          </div>
                          <span className="text-xs font-bold text-pkl-yellow flex-shrink-0">₹{p.price} Cr</span>
                        </div>
                      ))}
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

export default function PreviousAuctions() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pkl_auction_history');
      if (!raw) return;
      const history = JSON.parse(raw);
      // Normalise each stored result into the AuctionCard shape
      const normalized = history.map((r, idx) => {
        // Find the current user's team in the result
        const myTeam = r.teams?.find(t => t.id === (user?.id || user?.email || 'local'))
          || r.teams?.[0]
          || null;

        const sorted = [...(r.teams || [])].sort((a, b) => {
          if (b.players.length !== a.players.length) return b.players.length - a.players.length;
          return (a.purse - a.remaining) < (b.purse - b.remaining) ? 1 : -1;
        });
        const myRank = myTeam ? sorted.findIndex(t => t.id === myTeam.id) + 1 : idx + 1;
        const purseUsed = myTeam ? (myTeam.purse - (myTeam.remaining ?? myTeam.purse)) : 0;

        return {
          roomId: r.roomCode || `room-${idx}`,
          roomName: r.roomCode ? `Room ${r.roomCode}` : 'PKL Auction',
          timestamp: r.timestamp || Date.now(),
          totalParticipants: r.teams?.length || 1,
          rank: myRank,
          totalPoints: myTeam?.players?.length || 0,
          players: myTeam?.players || [],
          purseUsed: parseFloat(purseUsed.toFixed(2)),
          soldCount: r.soldPlayers?.length || 0,
          unsoldCount: r.unsoldPlayers?.length || 0,
        };
      });
      setAuctions(normalized);
    } catch (_) {}
  }, [user]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-pkl-yellow/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-pkl-yellow" />
            </div>
            <div>
              <h1 className="font-cardo text-3xl sm:text-4xl font-bold text-foreground">Past Auctions</h1>
              {user?.full_name && (
                <p className="text-muted-foreground text-sm">{user.full_name}'s auction history</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats overview — only shown if there's data */}
        {auctions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Trophy, label: 'Total Auctions', value: auctions.length, color: 'text-pkl-yellow' },
              { icon: Star, label: 'Wins', value: auctions.filter(a => a.rank === 1).length, color: 'text-pkl-green' },
              { icon: TrendingUp, label: 'Best Points', value: Math.max(...auctions.map(a => a.totalPoints)), color: 'text-blue-400' },
              { icon: Medal, label: 'Best Rank', value: `#${Math.min(...auctions.map(a => a.rank))}`, color: 'text-purple-400' },
            ].map((s, i) => (
              <GlassCard key={i} className="text-center py-4">
                <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* Auction list or empty state */}
        {auctions.length === 0 ? (
          <EmptyState userName={user?.full_name} />
        ) : (
          <div className="space-y-3">
            {auctions.map((auction, i) => (
              <AuctionCard key={auction.roomId} auction={auction} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}