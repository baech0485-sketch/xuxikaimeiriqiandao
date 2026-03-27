'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { playCelebrationSound } from '@/lib/sounds'

interface StarBurstProps {
  show: boolean
  onComplete: () => void
}

const PARTICLES = Array.from({ length: 16 }).map((_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  distance: 100 + Math.random() * 80,
  emoji: ['⭐', '🌟', '✨', '💫', '🎉', '💖'][i % 6],
  delay: i * 0.03,
}))

export default function StarBurst({ show, onComplete }: StarBurstProps) {
  useEffect(() => {
    if (show) {
      playCelebrationSound()
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

          {PARTICLES.map((p) => (
            <motion.span
              key={`${p.emoji}-${p.angle}`}
              className="absolute pointer-events-none text-xl opacity-70"
              initial={{ x: 0, y: 0, opacity: 0.7, scale: 0 }}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: [0.7, 0.5, 0],
                scale: [0, 1.2, 0.3],
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.span>
          ))}

          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.1 }}
          >
            <p className="mb-3 text-5xl">🏆</p>
            <div className="clay-card px-8 py-5 shadow-clay">
              <p className="font-display text-2xl font-bold text-clay-text">太棒了！</p>
              <p className="mt-1.5 text-sm text-clay-text-muted">今日全部完成！星星 +1</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
