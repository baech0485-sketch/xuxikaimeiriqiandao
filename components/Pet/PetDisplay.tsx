'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PET_MOODS } from '@/lib/constants'
import type { PetMood } from '@/lib/constants'
import { playPetTapSound } from '@/lib/sounds'

interface PetDisplayProps {
  petType: string
  petEmoji: string
  petImage?: string
  petImagePng?: string
  petImageEating?: string
  petImageEatingPng?: string
  petImageHungry?: string
  petImageHungryPng?: string
  petImageSad?: string
  petImageSadPng?: string
  mood: PetMood
  isEating?: boolean
  petName: string
  hungryDays: number
  recallProgress: number
  riveFile?: string
}

interface TapParticle {
  id: number
  x: number
  y: number
  emoji: string
}

const TAP_EMOJIS = ['💖', '💕', '✨', '🌟', '❤️', '💗']
let particleId = 0

const BREATHING = {
  happy: { scale: [1, 1.035, 1], duration: 2.8 },
  hungry: { scale: [1, 1.02, 1], duration: 2.2 },
  sad: { scale: [1, 0.97, 1], duration: 3.5 },
  runaway: { scale: [1, 1, 1], duration: 1 },
}

export default function PetDisplay({
  petEmoji, petImage, petImagePng, petImageEating, petImageEatingPng,
  petImageHungry, petImageHungryPng, petImageSad, petImageSadPng,
  mood, petName, recallProgress, isEating,
}: PetDisplayProps) {
  const moodInfo = PET_MOODS[mood]
  const heartCount = mood === 'happy' ? 5 : mood === 'hungry' ? 3 : 1

  const [tapParticles, setTapParticles] = useState<TapParticle[]>([])
  const [isTapped, setIsTapped] = useState(false)
  const [blinkPhase, setBlinkPhase] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mood === 'runaway') return
    const blink = () => {
      setBlinkPhase(true)
      setTimeout(() => setBlinkPhase(false), 150)
    }
    const interval = setInterval(() => {
      blink()
      if (Math.random() > 0.6) setTimeout(blink, 300)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [mood])

  const handleTap = useCallback(() => {
    if (mood === 'runaway') return
    playPetTapSound()
    setIsTapped(true)
    setTimeout(() => setIsTapped(false), 400)

    const newParticles: TapParticle[] = Array.from({ length: 4 }, () => ({
      id: particleId++,
      x: (Math.random() - 0.5) * 100,
      y: -20 - Math.random() * 40,
      emoji: TAP_EMOJIS[Math.floor(Math.random() * TAP_EMOJIS.length)],
    }))
    setTapParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setTapParticles(prev => prev.filter(p => !newParticles.includes(p)))
    }, 1200)
  }, [mood])

  const breathing = BREATHING[mood]

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <AnimatePresence mode="wait">
        {mood === 'runaway' ? (
          <motion.div
            key="runaway"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4 text-center"
          >
            <div className="relative mx-auto w-36 h-28 mb-4">
              <div className="absolute bottom-0 h-16 w-full rounded-[50%] border-2 border-clay-amber/20 bg-gradient-to-t from-clay-amber-light/40 to-transparent" />
              <div className="absolute bottom-3 w-full text-center text-4xl opacity-20">🏠</div>
            </div>
            <div className="mx-auto max-w-[240px] rounded-[24px] border-2 border-dashed border-clay-amber/30 bg-clay-amber-light/40 p-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-clay-amber">一封小信</p>
              <p className="text-sm leading-relaxed text-clay-text-muted">
                亲爱的主人，我饿了好几天了...
                <br />完成全部任务找回我吧！
              </p>
              {recallProgress > 0 && (
                <div className="mt-3 rounded-xl border-2 border-white/40 bg-white/40 p-2">
                  <p className="mb-1 text-[10px] font-bold text-clay-text-muted">召回进度 {recallProgress}/3</p>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className={`h-2.5 flex-1 rounded-full border border-white/40 transition-all duration-500 ${
                          i < recallProgress ? 'bg-clay-mint' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pet"
            className="relative py-4 cursor-pointer select-none"
            ref={containerRef}
            onClick={handleTap}
            style={{ touchAction: 'manipulation' }}
          >
            <motion.div
              className={`absolute inset-0 -m-8 rounded-full blur-3xl ${
                mood === 'happy' ? 'bg-duo-green-light' : mood === 'hungry' ? 'bg-duo-orange/20' : 'bg-gray-100'
              }`}
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />

            {mood === 'happy' && (
              <>
                {[0, 1, 2, 3].map(i => (
                  <motion.span
                    key={`env-${i}`}
                    className="absolute text-sm pointer-events-none"
                    style={{ left: `${15 + i * 20}%`, top: '-5px' }}
                    animate={{
                      y: [-5, -35, -5],
                      x: [0, (i % 2 === 0 ? 8 : -8), 0],
                      opacity: [0, 0.5, 0],
                      scale: [0.5, 0.9, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.8, ease: 'easeInOut' }}
                  >
                    {['💕', '✨', '💖', '🌟'][i]}
                  </motion.span>
                ))}
              </>
            )}

            {mood === 'hungry' && (
              <>
                {[0, 1].map(i => (
                  <motion.span
                    key={`sweat-${i}`}
                    className="absolute text-xs pointer-events-none"
                    style={{ right: `${15 + i * 15}%`, top: '10%' }}
                    animate={{ y: [0, 20], opacity: [0.5, 0], scale: [0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.9 }}
                  >
                    💧
                  </motion.span>
                ))}
              </>
            )}

            {mood === 'sad' && (
              <>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={`rain-${i}`}
                    className="absolute text-[10px] pointer-events-none opacity-30"
                    style={{ left: `${25 + i * 20}%`, top: '0px' }}
                    animate={{ y: [0, 30], opacity: [0.35, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                  >
                    💧
                  </motion.span>
                ))}
              </>
            )}

            <AnimatePresence>
              {tapParticles.map(p => (
                <motion.span
                  key={p.id}
                  className="absolute text-lg pointer-events-none z-30"
                  style={{ left: '50%', top: '30%' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: p.x,
                    y: p.y - 30,
                    opacity: [1, 0.8, 0],
                    scale: [0, 1.2, 0.6],
                    rotate: (Math.random() - 0.5) * 60,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: isTapped ? [1, 1.15, 0.92, 1.05, 1] : breathing.scale,
                rotate: isTapped ? [0, -5, 5, -3, 0] : (mood === 'happy' ? [0, 1.5, 0, -1.5, 0] : 0),
                y: mood === 'sad' ? [0, 3, 0] : 0,
                x: mood === 'hungry' ? [-2, 2, -2, 0] : 0,
              }}
              transition={
                isTapped
                  ? { duration: 0.5, ease: 'easeOut' }
                  : { repeat: Infinity, duration: breathing.duration, ease: 'easeInOut' }
              }
            >
              <div className="relative">
                {petImage ? (
                  <AnimatePresence mode="wait">
                    {(() => {
                      let imgSrc = petImage
                      let imgPng = petImagePng || ''
                      let imgKey = 'normal'

                      if (isEating && petImageEating) {
                        imgSrc = petImageEating
                        imgPng = petImageEatingPng || ''
                        imgKey = 'eating'
                      } else if (mood === 'hungry' && petImageHungry) {
                        imgSrc = petImageHungry
                        imgPng = petImageHungryPng || ''
                        imgKey = 'hungry'
                      } else if (mood === 'sad' && petImageSad) {
                        imgSrc = petImageSad
                        imgPng = petImageSadPng || ''
                        imgKey = 'sad'
                      }

                      return (
                        <motion.div
                          key={imgKey}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <picture>
                            <source srcSet={imgSrc} type="image/webp" />
                            <img src={imgPng} alt={petName} className="w-[140px] h-[140px] object-contain drop-shadow-lg" />
                          </picture>
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                ) : (
                  <span className="text-[100px] leading-none block">{petEmoji}</span>
                )}

                <AnimatePresence>
                  {blinkPhase && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.06 }}
                    >
                      <div
                        className="w-[60%] bg-gradient-to-b from-transparent via-[rgba(0,0,0,0.04)] to-transparent rounded-full"
                        style={{ height: '8%', marginTop: '-15%' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-clay-primary/5 rounded-[50%] blur-[2px]"
                  animate={{
                    scaleX: isTapped ? [1, 0.7, 1.1, 1] : (mood === 'happy' ? [1, 0.92, 1] : 1),
                    opacity: isTapped ? [0.5, 0.3, 0.6, 0.5] : [0.5, 0.4, 0.5],
                  }}
                  transition={
                    isTapped
                      ? { duration: 0.5 }
                      : { repeat: Infinity, duration: breathing.duration, ease: 'easeInOut' }
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-display text-xl font-bold text-duo-text">{petName}</p>

      {mood !== 'runaway' && (
        <motion.div
          className="relative rounded-xl border-2 border-duo-border bg-duo-surface px-4 py-2"
          animate={isTapped ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-duo-border" />
          <p className="text-center text-xs font-semibold text-duo-text-secondary">
            {isTapped ? '嘻嘻~好痒呀！' : isEating ? '好好吃呀~谢谢你喂我！' : moodInfo.message}
          </p>
        </motion.div>
      )}

      {mood !== 'runaway' && (
        <div className="mt-0.5 flex gap-0.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.span
              key={i}
              className="text-base"
              initial={false}
              animate={{ scale: i < heartCount ? [1, 1.15, 1] : 1, opacity: i < heartCount ? 0.85 : 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {i < heartCount ? '❤️' : '🩶'}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
