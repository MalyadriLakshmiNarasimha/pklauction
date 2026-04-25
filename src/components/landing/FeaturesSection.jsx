import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Users, Shield, BarChart3, Smartphone, Globe } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

const features = [
  { icon: Timer, title: 'Real-Time Bidding', desc: 'Instant bid updates with zero lag. Every second counts in the auction.', color: 'text-pkl-green' },
  { icon: Users, title: 'Multiplayer Rooms', desc: 'Create private rooms with friends or join public auctions.', color: 'text-pkl-yellow' },
  { icon: Shield, title: 'Fair & Secure', desc: 'Anti-cheat mechanisms ensure a level playing field for all.', color: 'text-blue-400' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Track team composition, purse usage, and auction stats in real-time.', color: 'text-pkl-purple' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Fully responsive design. Bid from anywhere on any device.', color: 'text-pink-400' },
  { icon: Globe, title: 'Global Access', desc: 'Connect with PKL fans worldwide. No geographical restrictions.', color: 'text-cyan-400' },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-pkl-green/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-cardo text-3xl sm:text-4xl font-bold text-foreground">
            Built for <span className="text-pkl-green">Champions</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Everything you need for the perfect PKL auction experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard glow className="h-full hover:border-pkl-green/20 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}