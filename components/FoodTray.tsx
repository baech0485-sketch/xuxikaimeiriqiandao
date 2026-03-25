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
              key={task.key}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all ${
                canFeed
                  ? 'bg-gradient-to-br from-candy-orange-light to-candy-pink-light shadow-kid cursor-pointer'
                  : isFed
                    ? 'bg-candy-mint-light/40 cursor-default'
                    : 'bg-gray-100/60 cursor-default'
              }`}
              onClick={() => canFeed && onFeed(task.key, task.food)}
              whileTap={canFeed ? { scale: 0.85 } : undefined}
              animate={canFeed ? { scale: [1, 1.06, 1] } : {}}
              transition={canFeed ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
              style={{ touchAction: 'manipulation' }}
              title={`${task.foodName}${canFeed ? ' - 点击投喂' : isFed ? ' - 已投喂' : ' - 未解锁'}`}
            >
              <span className={canFeed ? '' : isFed ? 'opacity-40' : 'opacity-20 grayscale'}>
                {task.food}
              </span>
              {isFed && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-candy-mint rounded-full flex items-center justify-center"
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
      <span className="text-[11px] font-bold text-gray-400">
        {hasFoods ? `${availableFoods.length}个食物可投喂` : '完成任务获得食物'}
      </span>
    </div>
  )
}
