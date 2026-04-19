import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hand, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../shared/GlassCard';
import AnimatedNumber from '../shared/AnimatedNumber';

export default function BidPanel({
  currentBid,
  currentBidder,
  basePrice = 0,
  myPurse,
  mySquadCount,
  maxSquad,
  bidIncrement,
  onBid,
  onWithdraw,
  onSkip,
  isMyBid,
  disabled,
  withdrawnLevels = new Set(), // bid amounts this user withdrew at for this player
  skipped = false,             // has this user skipped this player
}) {
  const [customIncrement, setCustomIncrement] = useState(bidIncrement);

  // First bid: must meet base price. Subsequent bids: +increment
  const firstBidAmount = basePrice;
  const nextBid = currentBid === 0 ? firstBidAmount : currentBid + customIncrement;

  const squadFull = mySquadCount >= maxSquad;
  const insufficientPurse = nextBid > myPurse;
  const alreadyWithdrawnAtNext = withdrawnLevels.has(nextBid);

  const canBid = !disabled && !insufficientPurse && !squadFull && !isMyBid && !alreadyWithdrawnAtNext && !skipped;

  const increments = [0.25, 0.5, 1, 2, 5];

  // Determine why bid is disabled (for display)
  const bidDisabledReason = (() => {
    if (skipped) return 'You skipped this player';
    if (squadFull) return 'Your squad is full';
    if (insufficientPurse) return 'Insufficient purse';
    if (isMyBid) return "You're the highest bidder!";
    if (alreadyWithdrawnAtNext) return `You withdrew at ₹${nextBid.toFixed(2)} Cr — wait for next increment`;
    return null;
  })();

  return (
    <GlassCard className="space-y-4">
      {/* Current Bid Display */}
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pkl-green/10 to-pkl-green/5 border border-pkl-green/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {currentBid === 0 ? 'Base Price' : 'Current Bid'}
        </p>
        <div className="text-4xl sm:text-5xl font-cardo font-bold text-pkl-green">
          {currentBid === 0 ? (
            <span>₹{basePrice.toFixed(2)} <span className="text-xl">Cr</span></span>
          ) : (
            <>₹<AnimatedNumber value={currentBid} decimals={2} /><span className="text-xl ml-1">Cr</span></>
          )}
        </div>
        {currentBid === 0 && (
          <p className="text-xs text-muted-foreground mt-1">No bids yet — place the first bid</p>
        )}
        {currentBidder && currentBid > 0 && (
          <motion.p
            key={currentBidder.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mt-2 font-medium"
            style={{ color: currentBidder.color || '#009B4D' }}
          >
            <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
            {currentBidder.name}
          </motion.p>
        )}
      </div>

      {/* Increment selector (only relevant after first bid) */}
      {currentBid > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Bid Increment</p>
          <div className="flex gap-2 flex-wrap">
            {increments.map(inc => (
              <button
                key={inc}
                onClick={() => setCustomIncrement(inc)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  customIncrement === inc
                    ? 'bg-pkl-green text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                +{inc} Cr
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => onBid(nextBid)}
          disabled={!canBid}
          className="w-full h-14 bg-pkl-green hover:bg-pkl-green/90 text-white text-lg font-bold rounded-xl glow-green disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          {currentBid === 0 ? `Open at ₹${firstBidAmount.toFixed(2)} Cr` : `Bid ₹${nextBid.toFixed(2)} Cr`}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onWithdraw}
            disabled={disabled || isMyBid || currentBid === 0 || skipped}
            variant="outline"
            className="h-10 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl disabled:opacity-40"
            title="Withdraw from this bid level (can re-bid if price increases)"
          >
            <Hand className="w-4 h-4 mr-1.5" />
            Withdraw
          </Button>

          <Button
            onClick={onSkip}
            disabled={disabled || skipped}
            variant="outline"
            className="h-10 border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 rounded-xl disabled:opacity-40"
            title="Skip — not interested in this player at all"
          >
            <SkipForward className="w-4 h-4 mr-1.5" />
            {skipped ? 'Skipped' : 'Skip'}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {bidDisabledReason && (
        <p className={`text-xs text-center ${isMyBid ? 'text-pkl-green' : 'text-muted-foreground'}`}>
          {bidDisabledReason}
        </p>
      )}

      {/* Withdraw info */}
      {withdrawnLevels.size > 0 && !skipped && (
        <p className="text-xs text-muted-foreground/60 text-center">
          Withdrawn at: {[...withdrawnLevels].map(v => `₹${v.toFixed(2)}`).join(', ')} Cr
        </p>
      )}
    </GlassCard>
  );
}