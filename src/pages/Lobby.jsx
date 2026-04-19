import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogIn, Users, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GlassCard from '../components/shared/GlassCard';
import { generateRoomCode } from '@/lib/pklClient';
import { toast } from 'sonner';

export default function Lobby() {
  const navigate = useNavigate();

  // Create flow
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1=room name, 2=team name
  const [roomName, setRoomName] = useState('');
  const [createTeamName, setCreateTeamName] = useState('');

  // Join flow
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinStep, setJoinStep] = useState(1); // 1=room code, 2=team name
  const [joinCode, setJoinCode] = useState('');
  const [joinTeamName, setJoinTeamName] = useState('');

  const handleCreateNext = () => {
    if (!roomName.trim()) { toast.error('Enter a room name'); return; }
    setCreateStep(2);
  };

  const handleCreate = () => {
    if (!createTeamName.trim()) { toast.error('Enter your team name'); return; }
    const code = generateRoomCode();
    setCreateOpen(false);
    setCreateStep(1);
    navigate(`/room/${code}?admin=true&name=${encodeURIComponent(roomName || 'PKL Auction')}&team=${encodeURIComponent(createTeamName)}`);
  };

  const handleJoinNext = () => {
    if (joinCode.trim().length < 4) { toast.error('Enter a valid room code'); return; }
    setJoinStep(2);
  };

  const handleJoin = () => {
    if (!joinTeamName.trim()) { toast.error('Enter your team name'); return; }
    setJoinOpen(false);
    setJoinStep(1);
    navigate(`/room/${joinCode.trim().toUpperCase()}?team=${encodeURIComponent(joinTeamName)}`);
  };

  const resetCreate = (open) => {
    setCreateOpen(open);
    if (!open) { setCreateStep(1); setRoomName(''); setCreateTeamName(''); }
  };

  const resetJoin = (open) => {
    setJoinOpen(open);
    if (!open) { setJoinStep(1); setJoinCode(''); setJoinTeamName(''); }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-cardo text-4xl sm:text-5xl font-bold text-foreground">
            Auction <span className="text-pkl-green">Lobby</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Create a new auction room or join an existing one</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Create Room */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Dialog open={createOpen} onOpenChange={resetCreate}>
              <DialogTrigger asChild>
                <GlassCard className="cursor-pointer hover:border-pkl-green/30 transition-all duration-300 group h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-pkl-green/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-pkl-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Create Room</h3>
                  <p className="text-sm text-muted-foreground">Set up a new auction with your rules</p>
                </GlassCard>
              </DialogTrigger>
              <DialogContent className="glass-card border-border/50 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-cardo text-2xl">
                    {createStep === 1 ? 'Create Auction Room' : 'Name Your Team'}
                  </DialogTitle>
                </DialogHeader>
                {createStep === 1 ? (
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Room Name</label>
                      <Input
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                        placeholder="e.g. Friends PKL Auction"
                        className="bg-muted/50 border-border/50"
                        onKeyDown={e => e.key === 'Enter' && handleCreateNext()}
                        autoFocus
                      />
                    </div>
                    <Button onClick={handleCreateNext} className="w-full h-12 bg-pkl-green hover:bg-pkl-green/90 text-white text-base font-semibold rounded-xl">
                      Next →
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground">Room: <span className="text-foreground font-medium">{roomName}</span></p>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Your Team Name</label>
                      <Input
                        value={createTeamName}
                        onChange={e => setCreateTeamName(e.target.value)}
                        placeholder="e.g. Patna Pirates"
                        className="bg-muted/50 border-border/50"
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setCreateStep(1)} variant="outline" className="flex-1 h-12 rounded-xl">
                        ← Back
                      </Button>
                      <Button onClick={handleCreate} className="flex-1 h-12 bg-pkl-green hover:bg-pkl-green/90 text-white text-base font-semibold rounded-xl">
                        Create Room
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Join Room */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Dialog open={joinOpen} onOpenChange={resetJoin}>
              <DialogTrigger asChild>
                <GlassCard className="cursor-pointer hover:border-pkl-yellow/30 transition-all duration-300 group h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-pkl-yellow/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <LogIn className="w-8 h-8 text-pkl-yellow" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Join Room</h3>
                  <p className="text-sm text-muted-foreground">Enter a code and your team name</p>
                </GlassCard>
              </DialogTrigger>
              <DialogContent className="glass-card border-border/50 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-cardo text-2xl">
                    {joinStep === 1 ? 'Join Auction Room' : 'Name Your Team'}
                  </DialogTitle>
                </DialogHeader>
                {joinStep === 1 ? (
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Room Code</label>
                      <Input
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="e.g. AB12CD"
                        maxLength={6}
                        className="bg-muted/50 border-border/50 text-center text-xl tracking-widest font-mono"
                        onKeyDown={e => e.key === 'Enter' && handleJoinNext()}
                        autoFocus
                      />
                    </div>
                    <Button onClick={handleJoinNext} className="w-full h-12 bg-pkl-yellow hover:bg-pkl-yellow/90 text-pkl-dark text-base font-semibold rounded-xl">
                      Next →
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground">Room Code: <span className="text-foreground font-mono font-medium">{joinCode}</span></p>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Your Team Name</label>
                      <Input
                        value={joinTeamName}
                        onChange={e => setJoinTeamName(e.target.value)}
                        placeholder="e.g. Bengal Warriors"
                        className="bg-muted/50 border-border/50"
                        onKeyDown={e => e.key === 'Enter' && handleJoin()}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setJoinStep(1)} variant="outline" className="flex-1 h-12 rounded-xl">
                        ← Back
                      </Button>
                      <Button onClick={handleJoin} className="flex-1 h-12 bg-pkl-yellow hover:bg-pkl-yellow/90 text-pkl-dark text-base font-semibold rounded-xl">
                        Join Room
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-14 max-w-3xl mx-auto"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-5">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Users, label: 'Create or Join', desc: 'Host creates a room and shares the 6-digit code with participants.', color: 'text-pkl-green' },
              { icon: Trophy, label: 'Configure & Bid', desc: 'Host sets purse, squad size and timer. Everyone bids in real-time.', color: 'text-pkl-yellow' },
              { icon: Clock, label: 'Results', desc: 'Auction ends with team summaries, rankings, and points breakdown.', color: 'text-purple-400' },
            ].map((s, i) => (
              <GlassCard key={i} className="text-center py-5 px-4">
                <s.icon className={`w-6 h-6 mx-auto mb-3 ${s.color}`} />
                <p className="text-sm font-semibold text-foreground mb-1">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}