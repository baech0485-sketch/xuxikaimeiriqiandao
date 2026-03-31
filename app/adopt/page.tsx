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

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-duo-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* 标题区域 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-duo-green text-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-duo-text md:text-4xl">
            选择你的学习伙伴
          </h1>
          <p className="mt-2 text-base text-duo-text-secondary">它会陪你一起学习，一起成长</p>
        </div>

        {/* 宠物选择卡片 */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {PET_TYPES.map((pet, i) => (
            <motion.button
              key={pet.type}
              type="button"
              className={`relative flex w-[130px] flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                selectedPet === i
                  ? 'border-duo-green bg-duo-green-light border-b-4'
                  : 'border-duo-border bg-duo-surface border-b-4 hover:border-duo-green/50'
              }`}
              onClick={() => handleSelect(i)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {selectedPet === i && (
                <motion.div
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-duo-green text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </motion.div>
              )}

              <motion.div
                className="h-20 w-20"
                animate={selectedPet === i ? { y: [0, -6, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <picture>
                  <source srcSet={pet.image} type="image/webp" />
                  <img src={pet.imagePng} alt={pet.name} className="h-full w-full object-contain drop-shadow-md" />
                </picture>
              </motion.div>
              <span className="font-bold text-duo-text">{pet.name}</span>
              <span className="text-xs text-duo-text-secondary">{pet.personality}</span>
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
              className="mx-auto max-w-md rounded-2xl border-2 border-duo-border bg-duo-surface p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-duo-text-secondary">你的名字</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="输入你的名字..."
                    className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-duo-text outline-none transition placeholder:text-duo-text-light focus:border-duo-green"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-duo-text-secondary">给宠物取个名字</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    placeholder="宠物的名字..."
                    className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-duo-text outline-none transition placeholder:text-duo-text-light focus:border-duo-green"
                    maxLength={10}
                  />
                </div>

                <motion.button
                  type="button"
                  className={`w-full rounded-xl py-4 text-lg font-bold uppercase tracking-wide transition ${
                    childName.trim() && petName.trim()
                      ? 'btn-duo'
                      : 'cursor-not-allowed border-2 border-duo-border bg-duo-bg text-duo-text-light'
                  }`}
                  onClick={handleAdopt}
                  disabled={!childName.trim() || !petName.trim() || loading}
                  whileTap={childName.trim() && petName.trim() ? { scale: 0.98 } : undefined}
                >
                  {loading ? (
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                      领养中...
                    </motion.span>
                  ) : (
                    '开始冒险'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 庆祝动画 */}
      <AnimatePresence>
        {showCelebration && selectedPet !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-duo-surface/90 backdrop-blur-sm" />

            {Array.from({ length: 16 }).map((_, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute text-2xl"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                  rotate: Math.random() * 360,
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 2, delay: i * 0.05 }}
              >
                {['&#11088;', '&#127881;', '&#10024;', '&#127882;'][i % 4]}
              </motion.span>
            ))}

            <motion.div
              className="relative rounded-2xl border-2 border-duo-border bg-duo-surface px-10 py-8 text-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, delay: 0.1 }}
            >
              <motion.div
                className="mx-auto mb-4 h-24 w-24"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <picture>
                  <source srcSet={PET_TYPES[selectedPet].image} type="image/webp" />
                  <img src={PET_TYPES[selectedPet].imagePng} alt="" className="h-full w-full object-contain" />
                </picture>
              </motion.div>
              <p className="font-display text-2xl font-bold text-duo-green">
                领养成功！
              </p>
              <p className="mt-2 text-duo-text-secondary">{petName} 成为你的小伙伴啦</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
