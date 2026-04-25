import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 1, className = '' }) {
  const spring = useSpring(0, { stiffness: 200, damping: 30 });
  const display = useTransform(spring, v => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const ref = useRef(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', v => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [display]);

  return <span ref={ref} className={className}>{prefix}{Number(value).toFixed(decimals)}{suffix}</span>;
}