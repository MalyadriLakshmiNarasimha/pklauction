import React from 'react';
import { Zap, Heart } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pkl-green to-pkl-green/70 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-cardo text-lg font-bold">PKL <span className="text-pkl-yellow">Auction</span></span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-pkl-green fill-pkl-green" /> for PKL fans
          </p>
          <p className="text-xs text-muted-foreground">© 2026 PKL Auction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}