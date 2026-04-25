import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   children?: React.ReactNode,
 *   className?: string,
 *   glow?: 'green' | 'yellow' | 'red'
 * } & Record<string, any>} props
 */
export default function GlassCard({ children, className = '', glow, ...props } = {}) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4',
        glow === 'green' && 'glow-green',
        glow === 'yellow' && 'glow-yellow',
        glow === 'red' && 'glow-red',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}