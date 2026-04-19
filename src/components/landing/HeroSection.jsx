import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pkl-green/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pkl-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pkl-green/30 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pkl-green/10 border border-pkl-green/20 mb-8">
              <Zap className="w-4 h-4 text-pkl-green" />
              <span className="text-sm text-pkl-green font-medium">Season 11 Auction Live</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-cardo text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
          >
            <span className="text-foreground">The Ultimate</span>
            <br />
            <span className="bg-gradient-to-r from-pkl-green via-pkl-yellow to-pkl-green bg-clip-text text-transparent">
              PKL Auction
            </span>
            <br />
            <span className="text-foreground">Experience</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Create rooms, invite friends, and bid on your favorite Pro Kabaddi players
            in a real-time auction experience that mirrors the actual PKL mega auction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/lobby">
              <Button className="h-14 px-8 bg-pkl-green hover:bg-pkl-green/90 text-white text-lg font-semibold rounded-xl glow-green group">
                Start Auction
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/lobby">
              <Button variant="outline" className="h-14 px-8 border-border/60 text-foreground text-lg rounded-xl hover:bg-muted/50">
                Join Room
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { icon: Users, value: '100K+', label: 'Players' },
              { icon: Trophy, value: '50K+', label: 'Auctions' },
              { icon: Zap, value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto text-pkl-green mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}