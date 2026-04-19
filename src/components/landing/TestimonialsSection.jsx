import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

const testimonials = [
  { name: 'Arjun Mehta', role: 'PKL Fan', text: 'Best auction platform I have used. The real-time feel is incredible!', rating: 5 },
  { name: 'Sneha Kapoor', role: 'League Organizer', text: 'We use this for our office PKL leagues. The team tracking is phenomenal.', rating: 5 },
  { name: 'Vikram Singh', role: 'Pro Player', text: 'Feels exactly like the real PKL auction. The tension is real!', rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-cardo text-3xl sm:text-4xl font-bold text-foreground">
            Loved by <span className="text-pkl-yellow">Fans</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="h-full">
                <Quote className="w-8 h-8 text-pkl-green/30 mb-4" />
                <p className="text-foreground leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-pkl-yellow text-pkl-yellow" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}