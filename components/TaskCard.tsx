'use client'

import { motion } from 'framer-motion'

interface TaskCardProps {
  task: { key: string; name: string; emoji: string }
  done: boolean
  completedAt: string | null
  onComplete: (taskKey: string) => void
  disabled?: boolean
}

export default function TaskCard({ task, done, completedAt, onComplete, disabled }: TaskCardProps) {
  return (
    <motion.button
      type="button"
      className={`group relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-100
        ${done 
          ? 'border-duo-green/30 bg-duo-green-light' 
          : 'border-duo-border bg-duo-surface hover:border-duo-border'
        }
        ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${!done ? 'cursor-pointer border-b-4 active:border-b-2 active:mt-0.5' : ''}
      `}
      onClick={() => !done && !disabled && onComplete(task.key)}
      whileTap={!done ? { scale: 0.98 } : undefined}
      layout
    >
      <div className="relative flex items-center gap-4 px-4 py-4">
        {/* 任务图标 */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${
          done 
            ? 'bg-duo-green/20' 
            : 'bg-duo-bg'
        }`}>
          {task.emoji}
        </div>

        {/* 任务信息 */}
        <div className="min-w-0 flex-grow text-left">
          <span className={`block text-base font-bold ${done ? 'text-duo-green-dark' : 'text-duo-text'}`}>
            {task.name}
          </span>
          <span className={`text-sm ${done ? 'text-duo-green' : 'text-duo-text-secondary'}`}>
            {done ? (completedAt ? `${completedAt} 完成` : '已完成') : '点击完成任务'}
          </span>
        </div>

        {/* 完成状态 */}
        <div className="flex-shrink-0">
          {done ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-duo-green text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </motion.div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-duo-border bg-duo-bg text-duo-text-secondary transition group-hover:border-duo-green group-hover:text-duo-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
