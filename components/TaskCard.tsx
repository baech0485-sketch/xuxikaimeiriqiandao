'use client'

import { motion } from 'framer-motion'

const TASK_COLORS: Record<string, { bg: string; border: string; stripe: string; doneBg: string }> = {
  literacy: { bg: 'bg-[#0c1728]/90', border: 'border-[#ff7aa2]/20', stripe: 'from-[#ff7aa2] to-[#ffb2c8]', doneBg: 'bg-[#0d1e1a]/95' },
  math: { bg: 'bg-[#0b1727]/90', border: 'border-[#66bfff]/20', stripe: 'from-[#66bfff] to-[#83f3ff]', doneBg: 'bg-[#0d1e1a]/95' },
  writing: { bg: 'bg-[#10142a]/90', border: 'border-[#ad8cff]/20', stripe: 'from-[#ad8cff] to-[#d0c0ff]', doneBg: 'bg-[#0d1e1a]/95' },
  reading: { bg: 'bg-[#17131f]/90', border: 'border-[#ffd166]/20', stripe: 'from-[#ffd166] to-[#ffef95]', doneBg: 'bg-[#0d1e1a]/95' },
  drawing: { bg: 'bg-[#18131d]/90', border: 'border-[#ff9f68]/20', stripe: 'from-[#ff9f68] to-[#ffd39f]', doneBg: 'bg-[#0d1e1a]/95' },
  skipping: { bg: 'bg-[#0d1a1e]/90', border: 'border-[#48e5c2]/20', stripe: 'from-[#48e5c2] to-[#89ffd6]', doneBg: 'bg-[#0d1e1a]/95' },
  english: { bg: 'bg-[#0d1824]/90', border: 'border-[#7fd1ff]/20', stripe: 'from-[#7fd1ff] to-[#a7e5ff]', doneBg: 'bg-[#0d1e1a]/95' },
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
      className={`group relative w-full overflow-hidden rounded-[24px] border transition-all duration-300
        ${done ? `${colors.doneBg} border-emerald-400/20` : `${colors.bg} ${colors.border}`}
        min-h-[88px] ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${!done ? 'active:scale-[0.985] hover:-translate-y-0.5' : ''}
      `}
      onClick={() => !done && !disabled && onComplete(task.key)}
      whileTap={!done ? { scale: 0.985 } : undefined}
      layout
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_38%)] opacity-70" />
      <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${done ? 'from-emerald-300 to-emerald-500' : colors.stripe}`} />

      <div className="relative flex items-center gap-4 px-5 py-4 text-left">
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border text-2xl ${
          done ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-white/8 bg-white/5'
        }`}>
          {task.emoji}
        </div>

        <div className="min-w-0 flex-grow">
          <div className="mb-2 flex items-center gap-2">
            <span className="mission-tag !px-3 !py-1 !text-[10px] !tracking-[0.2em]">task</span>
            <span className={`text-xs ${done ? 'text-emerald-300/80' : 'text-slate-400'}`}>
              {done ? '已确认完成' : '等待执行'}
            </span>
          </div>
          <span className={`block text-lg font-bold ${done ? 'text-slate-200' : 'text-white'}`}>
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
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/18 text-emerald-200 shadow-[0_0_24px_rgba(72,229,194,0.16)]">
                ✓
              </div>
              {completedAt && <p className="mt-2 text-[11px] text-slate-400">{completedAt}</p>}
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs uppercase tracking-[0.18em]">Go</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 transition group-hover:border-sky-300/30 group-hover:bg-sky-300/10">
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
