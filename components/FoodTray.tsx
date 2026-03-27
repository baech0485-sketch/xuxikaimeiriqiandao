'use client'

import { motion } from 'framer-motion'
import { TASKS } from '@/lib/constants'

interface FoodTrayProps {
  tasksDone: Record<string, boolean>
  fedTasks: string[]
  onFeed: (taskKey: string, foodEmoji: string) => void
  petMood: string
}

export default function FoodTray({ tasksDone, fedTasks, onFeed, petMood }: FoodTrayProps) {
  if (petMood === 'runaway') return null

  const availableFoods = TASKS.filter(t => tasksDone[t.key] && !fedTasks.includes(t.key))
  const hasFoods = availableFoods.length > 0

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {TASKS.map(task => {
          const isDone = !!tasksDone[task.key]
          const isFed = fedTasks.includes(task.key)
          const canFeed = isDone && !isFed

          return (
            <motion.button
              type="button"
              key={task.key}
              aria-label={`${task.foodName}${canFeed ? '，点击投喂' : isFed ? '，已投喂' : '，未解锁'}`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border text-lg transition-all ${
                canFeed
                  ? 'cursor-pointer border-amber-200/25 bg-[linear-gradient(135deg,rgba(255,183,77,0.22),rgba(255,122,162,0.18))] shadow-[0_0_24px_rgba(255,183,77,0.12)]'
                  : isFed
                    ? 'cursor-default border-emerald-300/18 bg-emerald-300/10'
                    : 'cursor-default border-white/6 bg-white/[0.03]'
              }`}
              onClick={() => canFeed && onFeed(task.key, task.food)}
              whileTap={canFeed ? { scale: 0.85 } : undefined}
              animate={canFeed ? { scale: [1, 1.06, 1] } : {}}
              transition={canFeed ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
              style={{ touchAction: 'manipulation' }}
              title={`${task.foodName}${canFeed ? ' - 点击投喂' : isFed ? ' - 已投喂' : ' - 未解锁'}`}
            >
              <span className={canFeed ? '' : isFed ? 'opacity-50' : 'opacity-20 grayscale'}>
                {task.food}
              </span>
              {isFed && (
                <motion.div
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <span className="text-white text-[8px]">✓</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      <span className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
        {hasFoods ? `${availableFoods.length}个食物可投喂` : '完成任务获得食物'}
      </span>
    </div>
  )
}
