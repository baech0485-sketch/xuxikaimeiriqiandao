'use client'

import { motion } from 'framer-motion'

const TASK_COLORS: Record<string, { bg: string; border: string; stripe: string; doneBg: string }> = {
  literacy: { bg: 'bg-[#FCF2F4]', border: 'border-[#E8A0B4]/15', stripe: 'bg-candy-pink', doneBg: 'bg-[#F0F8F0]' },
  math: { bg: 'bg-[#F0F6F9]', border: 'border-[#8CBFD6]/15', stripe: 'bg-candy-blue', doneBg: 'bg-[#F0F8F0]' },
  writing: { bg: 'bg-[#F5F0F9]', border: 'border-[#B8A0D6]/15', stripe: 'bg-candy-purple', doneBg: 'bg-[#F0F8F0]' },
  reading: { bg: 'bg-[#F9F6EE]', border: 'border-[#E8D48A]/15', stripe: 'bg-candy-yellow', doneBg: 'bg-[#F0F8F0]' },
  drawing: { bg: 'bg-[#F9F4EE]', border: 'border-[#DDB880]/15', stripe: 'bg-candy-orange', doneBg: 'bg-[#F0F8F0]' },
  skipping: { bg: 'bg-[#EFF6F2]', border: 'border-[#8BC5A0]/15', stripe: 'bg-candy-mint', doneBg: 'bg-[#F0F8F0]' },
}

interface TaskCardProps {
  task: { key: string; name: string; emoji: string }
  done: boolean
  completedAt: string | null
  onComplete: (taskKey: string) => void
  disabled?: boolean
}

export default function TaskCard({ task, done, completedAt, onComplete, disabled }: TaskCardProps) {
  const colors = TASK_COLORS[task.key] || TASK_COLORS.literacy

  return (
    <motion.button
      className={`w-full flex items-center gap-0 rounded-2xl transition-all duration-300 overflow-hidden
        ${done ? `${colors.doneBg} border border-[#8BC5A0]/20` : `${colors.bg} border ${colors.border}`}
        shadow-kid min-h-[64px]
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${!done ? 'active:scale-[0.97]' : ''}
      `}
      onClick={() => !done && !disabled && onComplete(task.key)}
      whileTap={!done ? { scale: 0.97 } : undefined}
      layout
    >
      <div className={`task-stripe self-stretch ${done ? 'bg-candy-mint' : colors.stripe} flex-shrink-0 opacity-60`} />

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mx-3
        ${done ? 'bg-candy-mint-light/50' : 'bg-white/50'}`}>
        {task.emoji}
      </div>

      <span className={`text-base font-bold flex-grow text-left ${done ? 'text-gray-500' : 'text-gray-600'}`}>
        {task.name}
      </span>

      <div className="flex-shrink-0 pr-4">
        {done ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="flex flex-col items-center"
          >
            <div className="w-9 h-9 rounded-full bg-candy-mint/70 flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            {completedAt && <p className="text-[10px] text-gray-400 mt-0.5">{completedAt}</p>}
          </motion.div>
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-gray-200/80 bg-white/40" />
        )}
      </div>
    </motion.button>
  )
}
