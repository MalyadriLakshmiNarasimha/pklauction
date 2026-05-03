import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowLeft, X, Shield, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlayerCard from '../components/auction/PlayerCard';
import BidTimer from '../components/auction/BitTimer';
import BidPanel from '../components/auction/BidPanel';
import TeamPanel from '../components/auction/TeamsPanel';
import ActivityFeed from '../components/auction/ActivityFeed';
import RoundBanner from '../components/auction/RoundBanner';
import PlayerFilterModal from '../components/auction/PlayerFilterModal';
import HostControls from '../components/auction/HostControls';
import GlassCard from '../components/shared/GlassCard';
import { TEAM_COLORS } from '@/lib/mockData';
import { useAuth } from '@/lib/AuthContext';
import { formatBasePrice } from '@/lib/utils';
import { usePKLPlayers } from '@/hooks/usePKLPlayers';
import { toast } from 'sonner';

const ROLE_ORDER = ['Raider', 'Defender', 'All Rounder'];

function normalizeRole(role) {
  return String(role || '').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function shuffleCopy(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function categoryWise(players) {
  const buckets = {
    raider: [],
    defender: [],
    'all rounder': [],
    other: [],
  };

  players.forEach(player => {
    const key = normalizeRole(player.role);
    if (key === 'raider') buckets.raider.push(player);
    else if (key === 'defender') buckets.defender.push(player);
    else if (key === 'all rounder') buckets['all rounder'].push(player);
    else buckets.other.push(player);
  });

  return [
    ...shuffleCopy(buckets.raider),
    ...shuffleCopy(buckets.defender),
    ...shuffleCopy(buckets['all rounder']),
    ...shuffleCopy(buckets.other),
  ];
}

function randomOrder(players) {
  return shuffleCopy(players);
}

function mixedOrder(players) {
  const buckets = ROLE_ORDER.map(role => shuffleCopy(
    players.filter(player => normalizeRole(player.role) === normalizeRole(role))
  ));
  const other = shuffleCopy(players.filter(player => !ROLE_ORDER.some(role => normalizeRole(player.role) === normalizeRole(role))));
  const rotation = shuffleCopy([...ROLE_ORDER, 'Other']);
  const ordered = [];

  while (buckets.some(bucket => bucket.length) || other.length) {
    rotation.forEach(role => {
      if (role === 'Other') {
        if (other.length) ordered.push(other.pop());
        return;
      }
      const index = ROLE_ORDER.findIndex(item => item === role);
      if (index >= 0 && buckets[index].length) {
        ordered.push(buckets[index].shift());
      }
    });
  }

  return ordered;
}

// ── Auction phase states ─────────────────────────────────────────────────────
// 'pre'         — waiting for host to select players and start
// 'bidding'     — normal bidding is live
// 'round2_filter' — host selects players for round 2 from unsold pool
// 'complete'    — auction is over

export default function AuctionRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerAccountId = user?.id || user?.email || 'local';
  const ownerAccountEmail = user?.email || '';

  // Load enriched players with stats
  const { players: enrichedPlayers, loading: playersLoading } = usePKLPlayers();

  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin      = urlParams.get('admin') === 'true';
  const configPurse  = Number(urlParams.get('purse'))  || 100;
  const configSquad  = Number(urlParams.get('squad'))  || 15;
  const configTimer  = Number(urlParams.get('timer'))  || 30;
  // Team name from lobby
  const teamNameParam = urlParams.get('team') || (user?.full_name || 'My Team');

  // ── Current user identity ──────────────────────────────────────────────────
  const currentUser = user
    ? { id: user.id || user.email, name: teamNameParam, email: user.email, color: TEAM_COLORS[0] }
    : { id: 'local', name: teamNameParam, email: '', color: TEAM_COLORS[0] };

  // ── Phase ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('pre'); // pre | bidding | round2_filter | complete
  const [round, setRound] = useState('normal'); // normal | unsold

  // ── Players ────────────────────────────────────────────────────────────────
  const [playerQueue, setPlayerQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);

  // ── Bidding state ──────────────────────────────────────────────────────────
  // Bid starts at 0; first bidder must bid >= base price
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null); // null | 'sold' | 'unsold'

  // Skip tracking: set of user IDs that skipped the current player
  const [skippedUsers, setSkippedUsers] = useState(new Set());
  // Total active bidders count (in a real multi-user setup this comes from socket)
  const totalBidders = 1; // Local single-user mode

  // Withdraw tracking: { [playerId]: Set<bidLevel> } — tracks bid levels user withdrew at
  const [withdrawnBids, setWithdrawnBids] = useState({});

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [timer, setTimer] = useState(configTimer);
  const [timerRunning, setTimerRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // ── Teams ──────────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState(() => ({
    [currentUser.id]: {
      id: currentUser.id,
      name: currentUser.name,
      color: currentUser.color,
      purse: configPurse,
      players: [],
    },
  }));

  // Keep team map aligned if user id changes from temporary "local" to authenticated id.
  useEffect(() => {
    setTeams(prev => {
      if (prev[currentUser.id]) return prev;

      if (prev.local) {
        const { local, ...rest } = prev;
        return {
          ...rest,
          [currentUser.id]: {
            ...local,
            id: currentUser.id,
            name: currentUser.name,
            color: currentUser.color,
          },
        };
      }

      return {
        ...prev,
        [currentUser.id]: {
          id: currentUser.id,
          name: currentUser.name,
          color: currentUser.color,
          purse: configPurse,
          players: [],
        },
      };
    });
  }, [currentUser.id, currentUser.name, currentUser.color, configPurse]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set());
  const [round2SelectedIds, setRound2SelectedIds] = useState(new Set());
  const [auctionMode, setAuctionMode] = useState('mixed');
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, type: 'bid', message: '🏏 Auction room ready. Host is selecting players…', timestamp: Date.now() },
  ]);

  // Initialize selectedPlayerIds once enriched players are loaded
  useEffect(() => {
    if (enrichedPlayers && enrichedPlayers.length > 0) {
      setSelectedPlayerIds(new Set(enrichedPlayers.map(p => p.id)));
    }
  }, [enrichedPlayers]);

  const addActivity = useCallback((type, message) => {
    setActivityFeed(prev => [
      { id: Date.now() + Math.random(), type, message, timestamp: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  // ── Timer logic ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning && !paused && timer > 0 && !playerStatus) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, timerRunning, paused, playerStatus]);

  useEffect(() => {
    if (timer === 0 && timerRunning && !playerStatus) {
      setTimerRunning(false);
      if (currentBidder) {
        handleSold();
      } else {
        handleUnsold();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, timerRunning, playerStatus]);

  // ── Reset per-player bid tracking ─────────────────────────────────────────
  const resetPlayerTracking = useCallback(() => {
    setSkippedUsers(new Set());
    setCurrentBid(0);
    setCurrentBidder(null);
    setPlayerStatus(null);
    setTimer(configTimer);
    setTimerRunning(true);
  }, [configTimer]);

  // ── Sold ───────────────────────────────────────────────────────────────────
  const handleSold = useCallback(() => {
    if (!currentPlayer || !currentBidder) return;
    setPlayerStatus('sold');
    toast.success(`🎉 ${currentPlayer.name} SOLD to ${currentBidder.name} for ${formatBasePrice(currentBid)}!`);
    addActivity('sold', `${currentPlayer.name} SOLD to ${currentBidder.name} for ${formatBasePrice(currentBid)}`);

    setTeams(prev => {
      const team = prev[currentBidder.id] || {
        id: currentBidder.id, name: currentBidder.name, color: currentBidder.color,
        purse: configPurse, players: [],
      };
      return {
        ...prev,
        [currentBidder.id]: {
          ...team,
          purse: team.purse - currentBid,
          players: [...team.players, { ...currentPlayer, price: currentBid }],
        },
      };
    });

    setSoldPlayers(prev => [
      ...prev,
      { ...currentPlayer, soldTo: currentBidder.id, soldToName: currentBidder.name, soldPrice: currentBid },
    ]);
    setTimeout(() => moveToNextPlayer(), 2200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, currentBidder, currentBid, configPurse, addActivity]);

  // ── Unsold ─────────────────────────────────────────────────────────────────
  const handleUnsold = useCallback(() => {
    if (!currentPlayer) return;
    setPlayerStatus('unsold');
    toast.error(`${currentPlayer.name} went UNSOLD`);
    addActivity('unsold', `${currentPlayer.name} went UNSOLD`);
    if (round === 'normal') {
      setUnsoldPlayers(prev => [...prev, currentPlayer]);
    }
    setTimeout(() => moveToNextPlayer(), 1600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, round, addActivity]);

  // ── Move to next player ────────────────────────────────────────────────────
  const moveToNextPlayer = useCallback(() => {
    setCurrentIndex(idx => {
      const nextIdx = idx + 1;
      if (nextIdx < playerQueue.length) {
        const next = playerQueue[nextIdx];
        setCurrentPlayer(next);
        resetPlayerTracking();
        return nextIdx;
      }
      // Round 1 exhausted
      if (round === 'normal') {
        // If there are unsold players, prompt host to start round 2
        setUnsoldPlayers(prev => {
          if (prev.length > 0) {
            setPhase('round2_filter');
            setTimerRunning(false);
            setRound2SelectedIds(new Set(prev.map(p => p.id)));
            addActivity('bid', '⏳ Round 1 complete. Host selects players for Round 2…');
          } else {
            finishAuction();
          }
          return prev;
        });
      } else {
        // Round 2 exhausted
        finishAuction();
      }
      return idx;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerQueue, round, resetPlayerTracking, addActivity]);

  const finishAuction = useCallback(() => {
    setPhase('complete');
    setTimerRunning(false);
    addActivity('sold', '🏆 Auction Complete!');
    // Persist results to localStorage for Results page & PreviousAuctions
    setTimeout(() => {
      setTeams(currentTeams => {
        setSoldPlayers(currentSold => {
          setUnsoldPlayers(currentUnsold => {
            const result = {
              roomCode,
              timestamp: Date.now(),
              ownerAccountId,
              ownerAccountEmail,
              teams: Object.values(currentTeams).map(t => ({
                id: t.id, name: t.name, color: t.color,
                purse: configPurse,
                remaining: t.purse,
                players: t.players,
              })),
              soldPlayers: currentSold,
              unsoldPlayers: currentUnsold,
            };
            try {
              // Save current result
              localStorage.setItem(`pkl_result_${roomCode}`, JSON.stringify(result));
              // Append to history
              const history = JSON.parse(localStorage.getItem('pkl_auction_history') || '[]');
              history.unshift(result);
              localStorage.setItem('pkl_auction_history', JSON.stringify(history.slice(0, 20)));
            } catch (_) {}
            return currentUnsold;
          });
          return currentSold;
        });
        return currentTeams;
      });
    }, 100);
  }, [roomCode, configPurse, ownerAccountId, ownerAccountEmail, addActivity]);

  // ── Start auction (round 1) ────────────────────────────────────────────────
  const startAuction = useCallback(() => {
    if (!enrichedPlayers) { toast.error('Loading players...'); return; }
    const selected = enrichedPlayers.filter(p => selectedPlayerIds.has(p.id));
    if (selected.length === 0) { toast.error('Select at least one player'); return; }
    const orderedPlayers = auctionMode === 'category'
      ? categoryWise(selected)
      : auctionMode === 'random'
        ? randomOrder(selected)
        : mixedOrder(selected);

    setPlayerQueue(orderedPlayers);
    setCurrentIndex(0);
    setCurrentPlayer(orderedPlayers[0]);
    setRound('normal');
    setUnsoldPlayers([]);
    setSoldPlayers([]);
    resetPlayerTracking();
    setPhase('bidding');
    addActivity('bid', `🏏 Auction started! ${orderedPlayers.length} players in Round 1 (${auctionMode}).`);
    toast.success('Auction started!');
  }, [selectedPlayerIds, auctionMode, resetPlayerTracking, addActivity, enrichedPlayers]);

  // ── Start round 2 ─────────────────────────────────────────────────────────
  const startRound2 = useCallback(() => {
    const selected = unsoldPlayers.filter(p => round2SelectedIds.has(p.id));
    if (selected.length === 0) {
      finishAuction();
      return;
    }
    setPlayerQueue(selected);
    setCurrentIndex(0);
    setCurrentPlayer(selected[0]);
    setRound('unsold');
    setUnsoldPlayers([]);
    resetPlayerTracking();
    setPhase('bidding');
    addActivity('bid', `🔄 Round 2 started with ${selected.length} unsold players!`);
    toast.info('Round 2 — Unsold Players!');
  }, [unsoldPlayers, round2SelectedIds, resetPlayerTracking, finishAuction, addActivity]);

  // ── Host: End current round early ─────────────────────────────────────────
  const handleEndRound = useCallback(() => {
    if (round === 'normal') {
      // Collect remaining unplayed players as unsold
      const remaining = playerQueue.slice(currentIndex + 1);
      setUnsoldPlayers(prev => {
        const combined = [...prev, ...remaining];
        if (combined.length > 0) {
          setPhase('round2_filter');
          setTimerRunning(false);
          setPlayerStatus('unsold');
          setRound2SelectedIds(new Set(combined.map(p => p.id)));
          addActivity('bid', '⏭ Host ended Round 1. Select players for Round 2…');
        } else {
          finishAuction();
        }
        return combined;
      });
    } else {
      finishAuction();
    }
  }, [round, playerQueue, currentIndex, finishAuction, addActivity]);

  // ── Bid ────────────────────────────────────────────────────────────────────
  const handleBid = useCallback((amount) => {
    const team = teams[currentUser.id];
    if (!team) return;

    // First bid must be >= base price
    if (currentBid === 0 && amount < currentPlayer.basePrice) {
      toast.error(`First bid must be at least ${formatBasePrice(currentPlayer.basePrice)} (base price)`);
      return;
    }
    if (amount > team.purse) { toast.error('Insufficient purse'); return; }
    if (team.players.length >= configSquad) { toast.error('Squad is full'); return; }

    // Check if user withdrew at this exact bid level for this player
    const key = currentPlayer?.id;
    const withdrawnSet = withdrawnBids[key] || new Set();
    if (withdrawnSet.has(amount)) {
      toast.error(`You already withdrew at ${formatBasePrice(amount)} for this player`);
      return;
    }

    setCurrentBid(amount);
    setCurrentBidder({ ...currentUser });
    setTimer(configTimer);
    setSkippedUsers(new Set()); // reset skips on new bid
    addActivity('bid', `${currentUser.name} bid ${formatBasePrice(amount)}`);
  }, [teams, currentUser, currentPlayer, currentBid, configSquad, configTimer, withdrawnBids, addActivity]);

  // ── Withdraw ───────────────────────────────────────────────────────────────
  // Records that this user withdrew at the current bid level.
  // They can still bid again if the bid goes higher.
  const handleWithdraw = useCallback(() => {
    if (!currentPlayer) return;
    const key = currentPlayer.id;
    const level = currentBid;
    setWithdrawnBids(prev => {
      const set = new Set(prev[key] || []);
      set.add(level);
      return { ...prev, [key]: set };
    });
    addActivity('bid', `${currentUser.name} withdrew at ${formatBasePrice(level)}`);
    toast('Withdrawn — you can still bid if the price goes higher');
  }, [currentPlayer, currentBid, currentUser, addActivity]);

  // ── Skip ───────────────────────────────────────────────────────────────────
  // A skip means "not interested in this player at all"
  // If ALL active bidders skip → player goes UNSOLD immediately
  const handleSkip = useCallback(() => {
    if (!currentPlayer || playerStatus) return;
    const newSkipped = new Set(skippedUsers);
    newSkipped.add(currentUser.id);
    setSkippedUsers(newSkipped);
    addActivity('bid', `${currentUser.name} skipped ${currentPlayer.name}`);

    // In single-user mode: any skip = unsold immediately
    // In multi-user: check if ALL users skipped
    if (newSkipped.size >= totalBidders) {
      addActivity('unsold', `All bidders skipped — ${currentPlayer.name} is UNSOLD`);
      setTimerRunning(false);
      handleUnsold();
    } else {
      toast('Skipped — waiting for other bidders…');
    }
  }, [currentPlayer, playerStatus, skippedUsers, currentUser, totalBidders, addActivity, handleUnsold]);

  // ── Pause ──────────────────────────────────────────────────────────────────
  const handlePause = () => {
    setPaused(p => {
      addActivity('bid', !p ? '⏸ Auction paused' : '▶ Auction resumed');
      return !p;
    });
  };

  // ── Chat ───────────────────────────────────────────────────────────────────
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), user: currentUser.name, text: chatInput.trim(), timestamp: Date.now() }]);
    setChatInput('');
  };

  const myTeam = teams[currentUser.id];

  // ── Current user's withdrawn bid levels for this player ───────────────────
  const withdrawnForCurrentPlayer = currentPlayer
    ? (withdrawnBids[currentPlayer.id] || new Set())
    : new Set();

  // ── PHASE: Complete ────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}>
          <GlassCard className="max-w-md w-full text-center py-14 px-8" glow="yellow">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="font-cardo text-4xl font-bold text-pkl-yellow mb-3">Auction Complete!</h1>
            <p className="text-muted-foreground mb-8">All players have been auctioned successfully.</p>
            <Button
              onClick={() => navigate(`/results/${roomCode}`)}
              className="bg-pkl-green hover:bg-pkl-green/90 text-white h-12 px-10 rounded-xl text-base font-semibold glow-green"
            >
              View Final Results
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ── PHASE: Round 2 filter ──────────────────────────────────────────────────
  if (phase === 'round2_filter') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <GlassCard className="py-10 px-8 text-center" glow="green">
            <div className="text-4xl mb-4">🔄</div>
            <h2 className="font-cardo text-3xl font-bold text-foreground mb-2">Round 1 Complete</h2>
            <p className="text-muted-foreground mb-6">
              {unsoldPlayers.length} player{unsoldPlayers.length !== 1 ? 's' : ''} went unsold.
              {isAdmin ? ' Select which players go into Round 2.' : ' Waiting for host to start Round 2…'}
            </p>

            {isAdmin && (
              <>
                <div className="text-left mb-6 space-y-2 max-h-60 overflow-y-auto">
                  {unsoldPlayers.map(p => (
                    <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={round2SelectedIds.has(p.id)}
                        onChange={() => {
                          setRound2SelectedIds(prev => {
                            const next = new Set(prev);
                            next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                            return next;
                          });
                        }}
                        className="w-4 h-4 accent-pkl-green"
                      />
                      <span className="text-sm text-foreground flex-1">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.role}</span>
                      <span className="text-xs text-pkl-green font-medium">{formatBasePrice(p.basePrice)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={finishAuction}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    End Auction
                  </Button>
                  <Button
                    onClick={startRound2}
                    className="flex-1 h-12 bg-pkl-green hover:bg-pkl-green/90 text-white rounded-xl font-semibold"
                  >
                    Start Round 2 ({round2SelectedIds.size})
                  </Button>
                </div>
              </>
            )}

            {!isAdmin && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-pkl-green rounded-full animate-pulse" />
                Waiting for host to start Round 2…
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Topbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-screen-2xl mx-auto px-3 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="text-muted-foreground flex-shrink-0" onClick={() => navigate('/lobby')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-cardo text-base sm:text-lg font-bold whitespace-nowrap">
              PKL <span className="text-pkl-yellow">Auction</span>
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-muted/60 text-muted-foreground font-mono hidden sm:inline">{roomCode}</span>
            {isAdmin && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-pkl-yellow/15 text-pkl-yellow border border-pkl-yellow/30 font-medium items-center gap-1 hidden sm:inline-flex">
                <Shield className="w-3 h-3" /> Host
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {myTeam && (
              <div className="hidden sm:flex items-center gap-4 text-xs mr-2">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{myTeam.name}</span>
                </span>
                <span className="text-muted-foreground">Purse: <span className="text-pkl-green font-bold">₹{myTeam.purse.toFixed(1)} L</span></span>
                <span className="text-muted-foreground">Squad: <span className="text-foreground font-bold">{myTeam.players.length}/{configSquad}</span></span>
              </div>
            )}
            {isAdmin && phase === 'pre' && (
              <Button onClick={() => setFilterOpen(true)} size="sm" variant="outline" className="text-xs border-pkl-green/30 text-pkl-green hover:bg-pkl-green/10 h-8 gap-1">
                <Filter className="w-3 h-3" /> Players
              </Button>
            )}
            {isAdmin && phase === 'pre' && (
              <Button onClick={startAuction} size="sm" className="bg-pkl-green hover:bg-pkl-green/90 text-white h-8 text-xs">
                Start
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(!chatOpen)} className="relative flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
              {chatMessages.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-pkl-green rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="pt-14">
        {/* Pre-start */}
        {phase === 'pre' && (
          <div className="max-w-xl mx-auto pt-20 px-4 text-center">
            <GlassCard className="py-14" glow="green">
              <div className="text-5xl mb-4">🏏</div>
              <h2 className="font-cardo text-3xl font-bold text-foreground mb-3">
                {isAdmin ? 'Ready to Start?' : 'Waiting for Host…'}
              </h2>
              <p className="text-muted-foreground mb-2">
                {isAdmin
                  ? `${selectedPlayerIds.size} players selected.`
                  : 'The host will start the auction shortly.'}
              </p>
              <p className="text-sm text-pkl-green font-medium mb-6">
                Your team: <span className="font-bold">{currentUser.name}</span>
              </p>
              {isAdmin && (
                <div className="space-y-3">
                  <Button onClick={() => setFilterOpen(true)} variant="outline" className="gap-2 border-pkl-green/30 text-pkl-green">
                    Filter / Change Players ({selectedPlayerIds.size})
                  </Button>

                  <div className="text-left space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Auction Mode</p>
                    <select
                      value={auctionMode}
                      onChange={e => setAuctionMode(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pkl-green/20 bg-background/80 px-3 text-sm text-foreground outline-none transition focus:border-pkl-green focus:ring-2 focus:ring-pkl-green/20"
                    >
                      <option value="category">Category Wise</option>
                      <option value="random">Random</option>
                      <option value="mixed">Mixed</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Category Wise = Raiders, Defenders, All Rounders. Mixed keeps roles balanced.
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Live bidding */}
        {phase === 'bidding' && (
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 min-h-[calc(100vh-3.5rem)]">

              {/* Left: Teams */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <TeamPanel teams={teams} currentUserId={currentUser.id} maxSquad={configSquad} defaultPurse={configPurse} />
              </div>

              {/* Center */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
                <RoundBanner round={round} playerIndex={currentIndex} totalPlayers={playerQueue.length} />

                <AnimatePresence mode="wait">
                  <PlayerCard key={currentPlayer?.id} player={currentPlayer} status={playerStatus} />
                </AnimatePresence>

                <BidTimer timer={timer} maxTime={configTimer} paused={paused} />

                {isAdmin && (
                  <HostControls
                    paused={paused}
                    onPause={handlePause}
                    onSkip={handleSkip}
                    onEndRound={handleEndRound}
                  />
                )}

                <BidPanel
                  currentBid={currentBid}
                  currentBidder={currentBidder}
                  basePrice={currentPlayer?.basePrice || 0}
                  myPurse={myTeam?.purse || 0}
                  mySquadCount={myTeam?.players?.length || 0}
                  maxSquad={configSquad}
                  bidIncrement={0.01}
                  onBid={handleBid}
                  onWithdraw={handleWithdraw}
                  onSkip={handleSkip}
                  isMyBid={currentBidder?.id === currentUser.id}
                  disabled={!!playerStatus || paused || !timerRunning}
                  withdrawnLevels={withdrawnForCurrentPlayer}
                  skipped={skippedUsers.has(currentUser.id)}
                />
              </div>

              {/* Right: Activity */}
              <div className="lg:col-span-3 order-3">
                <ActivityFeed activities={activityFeed} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat drawer ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-14 right-0 bottom-0 w-72 sm:w-80 z-40 glass-card border-l border-border/50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Room Chat</h3>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="w-7 h-7">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className="text-xs">
                  <span className="text-pkl-green font-semibold">{m.user}: </span>
                  <span className="text-foreground/80">{m.text}</span>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 opacity-60">No messages yet…</p>
              )}
            </div>
            <div className="p-3 border-t border-border/50 flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message…"
                className="bg-muted/50 border-border/50 text-xs h-9"
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              />
              <Button onClick={handleSendChat} size="sm" className="bg-pkl-green hover:bg-pkl-green/90 text-white h-9 px-3">
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Player Filter Modal ── */}
      {enrichedPlayers && (
        <PlayerFilterModal
          open={filterOpen}
          onOpenChange={setFilterOpen}
          players={enrichedPlayers}
          selectedIds={selectedPlayerIds}
          onSelectionChange={setSelectedPlayerIds}
          readOnly={!isAdmin}
        />
      )}
    </div>
  );
}