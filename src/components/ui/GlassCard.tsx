'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Premium ease-out
      }}
      className={cn(
        "glass-card p-6 overflow-hidden relative group",
        "bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-3xl",
        "rounded-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        className
      )}
    >
      {/* Mesh Gradient Subtle Background inside card */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
