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
  const isRunaway = petMood === 'runaway'
  const availableFoods = TASKS.filter(t => tasksDone[t.key] && !fedTasks.includes(t.key))
  const hasFoods = availableFoods.length > 0

  return (
    <div className="flex flex-col items-center gap-3">
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
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border-2 text-lg transition-all ${
                canFeed
                  ? 'cursor-pointer border-duo-orange bg-duo-orange/10 border-b-4 active:border-b-2 active:mt-0.5'
                  : isFed
                    ? 'cursor-default border-duo-green/30 bg-duo-green-light'
                    : 'cursor-default border-duo-border bg-duo-bg'
              }`}
              onClick={() => canFeed && onFeed(task.key, task.food)}
              whileTap={canFeed ? { scale: 0.9 } : undefined}
              animate={canFeed ? { scale: [1, 1.05, 1] } : {}}
              transition={canFeed ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
              style={{ touchAction: 'manipulation' }}
              title={`${task.foodName}${canFeed ? ' - 点击投喂' : isFed ? ' - 已投喂' : ' - 未解锁'}`}
            >
              <span className={canFeed ? '' : isFed ? 'opacity-60' : 'opacity-25 grayscale'}>
                {task.food}
              </span>
              {isFed && (
                <motion.div
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-duo-green"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      <span className="text-xs font-bold text-duo-text-secondary">
        {isRunaway
          ? hasFoods
            ? `${availableFoods.length} 份食物可投喂，完成全部任务后可投喂召回`
            : '完成全部任务后可投喂召回'
          : hasFoods
            ? `${availableFoods.length} 份食物可投喂`
            : '完成任务获得食物'}
      </span>
    </div>
  )
}
