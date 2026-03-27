'use client'

import { motion } from 'framer-motion'

const TASK_COLORS: Record<string, { bg: string; border: string; stripe: string; doneBg: string; doneBorder: string }> = {
  literacy: { bg: 'bg-gradient-to-r from-rose-50 to-pink-50', border: 'border-rose-200/60', stripe: 'from-rose-400 to-pink-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  math: { bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-blue-200/60', stripe: 'from-blue-400 to-indigo-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  writing: { bg: 'bg-gradient-to-r from-violet-50 to-purple-50', border: 'border-violet-200/60', stripe: 'from-violet-400 to-purple-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  reading: { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-200/60', stripe: 'from-amber-400 to-yellow-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  drawing: { bg: 'bg-gradient-to-r from-orange-50 to-rose-50', border: 'border-orange-200/60', stripe: 'from-orange-400 to-rose-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  skipping: { bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', border: 'border-emerald-200/60', stripe: 'from-emerald-400 to-teal-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
  english: { bg: 'bg-gradient-to-r from-sky-50 to-cyan-50', border: 'border-sky-200/60', stripe: 'from-sky-400 to-cyan-400', doneBg: 'bg-clay-mint-light/60', doneBorder: 'border-clay-mint/30' },
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
      type="button"
      className={`group relative w-full overflow-hidden rounded-[24px] border-2 transition-all duration-300
        ${done ? `${colors.doneBg} ${colors.doneBorder}` : `${colors.bg} ${colors.border}`}
        min-h-[88px] ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${!done ? 'cursor-pointer hover:-translate-y-1 hover:shadow-clay active:translate-y-0.5 active:shadow-clay-pressed' : ''}
      `}
      style={{ boxShadow: done ? undefined : '4px 4px 10px rgba(0,0,0,0.04), -2px -2px 8px rgba(255,255,255,0.8)' }}
      onClick={() => !done && !disabled && onComplete(task.key)}
      whileTap={!done ? { scale: 0.985 } : undefined}
      layout
    >
      <div className={`absolute left-0 top-0 h-full w-2 rounded-r-full bg-gradient-to-b ${done ? 'from-clay-mint to-emerald-400' : colors.stripe}`} />

      <div className="relative flex items-center gap-4 px-5 py-4 text-left">
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border-2 text-2xl ${
          done ? 'border-clay-mint/30 bg-clay-mint/10' : 'border-white/60 bg-white/60'
        }`}
        style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)' }}
        >
          {task.emoji}
        </div>

        <div className="min-w-0 flex-grow">
          <div className="mb-2 flex items-center gap-2">
            <span className="clay-tag !px-3 !py-0.5 !text-[10px]">task</span>
            <span className={`text-xs font-semibold ${done ? 'text-clay-mint' : 'text-clay-text-muted'}`}>
              {done ? '已完成' : '待完成'}
            </span>
          </div>
          <span className={`block text-lg font-bold ${done ? 'text-clay-text-muted' : 'text-clay-text'}`}>
            {task.name}
          </span>
        </div>

        <div className="flex-shrink-0 pr-1 text-right">
          {done ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex flex-col items-end"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-clay-mint/40 bg-clay-mint/20 text-clay-mint font-bold shadow-clay-sm">
                &#10003;
              </div>
              {completedAt && <p className="mt-2 text-[11px] text-clay-text-light">{completedAt}</p>}
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-clay-text-muted">
              <span className="text-xs font-bold uppercase tracking-widest">Go</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/60 bg-white/50 transition group-hover:border-clay-primary/30 group-hover:bg-clay-primary/10 shadow-clay-sm">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
