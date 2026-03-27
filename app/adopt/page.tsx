'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PET_TYPES } from '@/lib/constants'

export default function AdoptPage() {
  const router = useRouter()
  const [selectedPet, setSelectedPet] = useState<number | null>(null)
  const [childName, setChildName] = useState('徐熙凯')
  const [petName, setPetName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleSelect = (index: number) => {
    setSelectedPet(index)
    setPetName(PET_TYPES[index].name)
  }

  const handleAdopt = async () => {
    if (selectedPet === null || !childName.trim() || !petName.trim()) return
    setLoading(true)
    const pet = PET_TYPES[selectedPet]
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: childName.trim(), petType: pet.type, petName: petName.trim() }),
    })
    setShowCelebration(true)
    setTimeout(() => router.push('/'), 2500)
  }

  const cardColors = [
    'from-rose-50 to-pink-50 border-rose-200/60',
    'from-sky-50 to-blue-50 border-sky-200/60',
    'from-emerald-50 to-teal-50 border-emerald-200/60',
    'from-amber-50 to-orange-50 border-amber-200/60',
    'from-violet-50 to-purple-50 border-violet-200/60',
  ]

  return (
    <main className="scene-bg flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-[100dvh]">
      {/* 装饰泡泡 */}
      <div className="clay-bubble left-[-40px] top-[10%] h-[120px] w-[120px] bg-clay-primary/8" />
      <div className="clay-bubble right-[-30px] top-[30%] h-[80px] w-[80px] bg-clay-pink/10" />
      <div className="clay-bubble left-[20%] bottom-[10%] h-[60px] w-[60px] bg-clay-gold/12" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-3"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <span className="text-5xl">🐾</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-clay-text mb-2 font-display">
            选一只小伙伴吧！
          </h1>
          <p className="text-base text-clay-text-muted">它会陪你一起学习，一起成长~</p>
        </div>

        {/* 宠物卡片 */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
          {PET_TYPES.map((pet, i) => (
            <motion.button
              key={pet.type}
              className={`relative rounded-3xl p-4 md:p-5 flex flex-col items-center gap-2 w-[140px] md:w-[150px] transition-all duration-300
                bg-gradient-to-b ${cardColors[i]} border-2
                ${selectedPet === i
                  ? 'ring-4 ring-clay-primary/30 shadow-clay scale-[1.05]'
                  : 'shadow-clay-sm hover:shadow-clay hover:scale-[1.02]'
                }
              `}
              onClick={() => handleSelect(i)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {selectedPet === i && (
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-clay-mint rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  &#10003;
                </motion.div>
              )}

              <motion.div
                className="w-20 h-20 md:w-24 md:h-24"
                animate={selectedPet === i ? { y: [0, -8, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <picture>
                  <source srcSet={pet.image} type="image/webp" />
                  <img src={pet.imagePng} alt={pet.name} className="w-full h-full object-contain drop-shadow-md" />
                </picture>
              </motion.div>
              <span className="font-bold text-clay-text text-base">{pet.name}</span>
              <span className="text-xs text-clay-text-muted leading-tight">{pet.personality}</span>
              <div className="flex items-center gap-1 text-xs text-clay-text-muted bg-white/60 px-2 py-0.5 rounded-full border border-white/40">
                <span>{pet.foodEmoji}</span>
                <span>{pet.food}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* 输入表单 */}
        <AnimatePresence>
          {selectedPet !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="clay-card max-w-md mx-auto p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-clay-text-muted mb-2 ml-1">你的名字</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="输入你的名字..."
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-clay-primary/20 focus:border-clay-primary/40 focus:outline-none text-lg bg-white/60 placeholder:text-clay-text-light transition-colors text-clay-text shadow-clay-sm"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-clay-text-muted mb-2 ml-1">给宠物取个名字</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    placeholder="宠物的名字..."
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-clay-pink/20 focus:border-clay-pink/40 focus:outline-none text-lg bg-white/60 placeholder:text-clay-text-light transition-colors text-clay-text shadow-clay-sm"
                    maxLength={10}
                  />
                </div>

                <motion.button
                  className={`w-full btn-kid text-white text-xl transition-all
                    ${childName.trim() && petName.trim()
                      ? 'bg-gradient-to-r from-clay-pink via-clay-primary to-clay-primary'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-gray-200'
                    }
                  `}
                  onClick={handleAdopt}
                  disabled={!childName.trim() || !petName.trim() || loading}
                  whileTap={childName.trim() && petName.trim() ? { scale: 0.96 } : undefined}
                >
                  {loading ? (
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                      领养中...
                    </motion.span>
                  ) : (
                    `领养 ${PET_TYPES[selectedPet].emoji} 回家！`
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 庆祝 */}
      <AnimatePresence>
        {showCelebration && selectedPet !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  opacity: 0,
                  rotate: Math.random() * 360,
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 2, delay: i * 0.04 }}
              >
                {['🎉', '💖', '⭐', '🎊', '✨', '🌈', '💕', '🎀'][i % 8]}
              </motion.span>
            ))}

            <motion.div
              className="relative clay-card px-10 py-8 text-center max-w-xs"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, delay: 0.1 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <picture>
                  <source srcSet={PET_TYPES[selectedPet].image} type="image/webp" />
                  <img src={PET_TYPES[selectedPet].imagePng} alt="" className="w-full h-full object-contain" />
                </picture>
              </motion.div>
              <p className="text-2xl font-bold font-display bg-gradient-to-r from-clay-pink to-clay-primary bg-clip-text text-transparent">
                领养成功！
              </p>
              <p className="text-clay-text-muted mt-2 text-base">{petName} 成为你的小伙伴啦~</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
