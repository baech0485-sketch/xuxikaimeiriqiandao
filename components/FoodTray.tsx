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
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-lg transition-all ${
                canFeed
                  ? 'cursor-pointer border-clay-amber/40 bg-gradient-to-br from-clay-amber-light to-clay-pink-light shadow-clay-sm'
                  : isFed
                    ? 'cursor-default border-clay-mint/30 bg-clay-mint-light'
                    : 'cursor-default border-white/40 bg-white/30'
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
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-clay-mint"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <span className="text-white text-[8px] font-bold">&#10003;</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      <span className="text-[11px] font-bold tracking-wider text-clay-text-muted uppercase">
        {hasFoods ? `${availableFoods.length}个食物可投喂` : '完成任务获得食物'}
      </span>
    </div>
  )
}
