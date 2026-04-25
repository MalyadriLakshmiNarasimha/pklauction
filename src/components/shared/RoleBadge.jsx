import React from 'react';
import { cn } from '@/lib/utils';

const roleStyles = {
  Raider: 'bg-pkl-green/15 text-pkl-green border-pkl-green/30',
  Defender: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'All-rounder': 'bg-pkl-purple/15 text-pkl-purple border-pkl-purple/30',
};

export default function RoleBadge({ role, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        roleStyles[role] || 'bg-muted text-muted-foreground border-border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {role}
    </span>
  );
}