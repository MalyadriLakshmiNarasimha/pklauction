import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import RoleBadge from '../shared/RoleBadge';
import { cn } from '@/lib/utils';

export default function PlayerFilterModal({ open, onOpenChange, players, selectedIds, onSelectionChange, readOnly = false }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');

  const roles = ['All', 'Raider', 'Defender', 'All-rounder'];
  const teams = useMemo(() => {
    const t = new Set(players.map(p => p.team));
    return ['All', ...Array.from(t)];
  }, [players]);

  const filtered = useMemo(() => {
    return players.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || p.role === roleFilter;
      const matchTeam = teamFilter === 'All' || p.team === teamFilter;
      return matchSearch && matchRole && matchTeam;
    });
  }, [players, search, roleFilter, teamFilter]);

  const togglePlayer = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  };

  const selectAll = () => onSelectionChange(new Set(filtered.map(p => p.id)));
  const clearAll = () => onSelectionChange(new Set());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-cardo text-2xl flex items-center justify-between">
            <span>{readOnly ? 'View Players' : 'Choose Players'}</span>
            <Badge className="bg-pkl-green/15 text-pkl-green border-pkl-green/30">
              {selectedIds.size} of {players.length} selected
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  roleFilter === r ? 'bg-pkl-green text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {!readOnly && (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} className="text-xs h-8">Select All</Button>
                <Button variant="outline" size="sm" onClick={clearAll} className="text-xs h-8">Clear All</Button>
              </div>
            </div>
          )}
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1">
          {filtered.map(player => {
            const selected = selectedIds.has(player.id);
            return (
              <motion.button
                key={player.id}
                onClick={() => !readOnly && togglePlayer(player.id)}
                whileTap={!readOnly ? { scale: 0.98 } : {}}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                  selected ? 'bg-pkl-green/10 border border-pkl-green/30' : 'bg-muted/20 border border-transparent hover:bg-muted/40'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  selected ? 'bg-pkl-green border-pkl-green' : 'border-border'
                )}>
                  {selected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.team}</p>
                </div>
                <RoleBadge role={player.role} />
                <span className="text-xs font-bold text-pkl-yellow flex-shrink-0">₹{player.basePrice} Cr</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button onClick={() => onOpenChange(false)} className="bg-pkl-green hover:bg-pkl-green/90 text-white">
              Confirm ({selectedIds.size} players)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}