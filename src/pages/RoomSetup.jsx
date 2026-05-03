import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Settings, Play, Users, Wallet, Timer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import GlassCard from '../components/shared/GlassCard';
import ParticipantsList from '../components/room/ParticipantsList';
import { useAuth } from '@/lib/AuthContext';
import { TEAM_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';

export default function RoomSetup() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';
  const roomName = urlParams.get('name') || 'PKL Auction Room';
  const teamName = urlParams.get('team') || '';

  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({ purse: 100, squadSize: 15, timerDuration: 30 });

  // Participants — in production these come from socket events
  const myParticipant = user
    ? { id: user.id || user.email, name: teamName || user.full_name || 'Host', email: user.email, isAdmin, color: TEAM_COLORS[0], isReady: false }
    : { id: 'local', name: teamName || (isAdmin ? 'Host' : 'Guest'), email: '', isAdmin, color: TEAM_COLORS[0], isReady: false };

  const [participants] = useState([myParticipant]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Room link copied!');
  };

  const teamNameParam = urlParams.get('team') || '';

  const startAuction = () => {
    navigate(`/auction/${roomCode}?admin=${isAdmin}&purse=${config.purse}&squad=${config.squadSize}&timer=${config.timerDuration}&team=${encodeURIComponent(teamNameParam)}`);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-cardo text-3xl sm:text-4xl font-bold text-foreground">{roomName}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isAdmin ? 'Configure settings and start the auction' : 'Waiting for host to start…'}
          </p>
          {teamName && (
            <p className="text-sm mt-1">
              Your team: <span className="text-pkl-green font-semibold">{teamName}</span>
            </p>
          )}
        </motion.div>

        {/* Room Code Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="mb-6" glow="green">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Room Code</p>
                <p className="text-4xl font-mono font-bold tracking-[0.35em] text-pkl-green">{roomCode}</p>
                <p className="text-xs text-muted-foreground mt-1">Share this code with participants</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyCode} variant="outline" className="gap-2 border-pkl-green/30 text-pkl-green hover:bg-pkl-green/10">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
                <Button onClick={shareLink} variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" title="Copy room link">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Settings — admin only */}
          {isAdmin && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-pkl-yellow" />
                  <h2 className="text-lg font-semibold text-foreground">Auction Settings</h2>
                </div>
                <div className="space-y-7">

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="w-4 h-4" /> Purse Amount
                      </Label>
                      <span className="text-sm font-bold text-pkl-green">₹{config.purse} Cr</span>
                    </div>
                    <Slider
                      value={[config.purse]}
                      onValueChange={([v]) => setConfig(c => ({ ...c, purse: v }))}
                       min={5} max={10} step={0.5}
                      className="[&_[role=slider]]:bg-pkl-green [&_[role=slider]]:border-pkl-green"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                       <span>₹5 Cr</span><span>₹10 Cr</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" /> Squad Size
                      </Label>
                      <span className="text-sm font-bold text-pkl-yellow">{config.squadSize} players</span>
                    </div>
                    <Slider
                      value={[config.squadSize]}
                      onValueChange={([v]) => setConfig(c => ({ ...c, squadSize: v }))}
                      min={8} max={25} step={1}
                      className="[&_[role=slider]]:bg-pkl-yellow [&_[role=slider]]:border-pkl-yellow"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>8</span><span>25</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="w-4 h-4" /> Bid Timer
                      </Label>
                      <span className="text-sm font-bold text-foreground">{config.timerDuration}s</span>
                    </div>
                    <Slider
                      value={[config.timerDuration]}
                      onValueChange={([v]) => setConfig(c => ({ ...c, timerDuration: v }))}
                      min={10} max={60} step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10s</span><span>60s</span>
                    </div>
                  </div>

                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Participants */}
          <motion.div
            initial={{ opacity: 0, x: isAdmin ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={!isAdmin ? 'lg:col-span-2' : ''}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pkl-green" />
                  <h2 className="text-lg font-semibold text-foreground">Participants</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pkl-green rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">{participants.length} joined</span>
                </div>
              </div>
              <ParticipantsList participants={participants} />

              {/* Waiting indicator for non-admin */}
              {!isAdmin && (
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-pkl-green rounded-full animate-pulse" />
                    Waiting for host to start the auction…
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Start Auction */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={startAuction}
              className="h-14 px-12 bg-pkl-green hover:bg-pkl-green/90 text-white text-lg font-semibold rounded-xl glow-green"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Auction
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              You can filter and select players inside the auction room
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}