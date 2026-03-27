'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TopNavProps {
  totalStars: number
  streak: number
  childName?: string
  starBounce?: boolean
  completedCount: number
  dailyGoal: number
  canFeedCount: number
  moodLabel: string
}

export default function TopNav({
  totalStars,
  streak,
  childName,
  starBounce,
  completedCount,
  dailyGoal,
  canFeedCount,
  moodLabel,
}: TopNavProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mission-panel px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-sky-300/20 bg-[radial-gradient(circle_at_top,#67d8ff55,#0d1727_70%)] shadow-[0_0_32px_rgba(102,191,255,0.18)]">
                <span className="text-2xl">✦</span>
              </div>
              <div>
                <div className="mission-tag mb-2">Habit Mission Control</div>
                <h1 className="font-display text-2xl font-bold tracking-[0.08em] text-slate-50 md:text-3xl">
                  小宠伴学
                </h1>
                <p className="mt-1 text-sm text-slate-300/80">
                  {childName ? `${childName} 的夜间任务舱已上线` : '今日观测站已启动'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
              <motion.div
                id="star-counter"
                className="mission-card-outline min-w-[116px] px-4 py-3"
                animate={starBounce ? { scale: [1, 1.18, 0.92, 1.06, 1] } : {}}
                transition={starBounce ? { duration: 0.5, ease: 'easeOut' } : {}}
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">星能储备</p>
                <div className="mt-2 flex items-center gap-2 text-amber-200">
                  <span className="text-lg">✦</span>
                  <span className="font-display text-2xl font-bold text-slate-50">{totalStars}</span>
                </div>
              </motion.div>

              <div className="mission-card-outline min-w-[116px] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">连续启动</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg text-rose-300">◉</span>
                  <span className="font-display text-2xl font-bold text-slate-50">{streak}</span>
                  <span className="text-sm text-slate-300">天</span>
                </div>
              </div>

              <div className="mission-card-outline min-w-[116px] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">任务进度</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-slate-50">{completedCount}</span>
                  <span className="text-sm text-slate-300">/ {dailyGoal}</span>
                </div>
                <p className="mt-1 text-xs text-emerald-300/80">{moodLabel} · {canFeedCount} 份补给待发放</p>
              </div>

              <div className="flex items-center gap-2 md:justify-end lg:justify-start">
                <a
                  href="/calendar"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-sky-300/20 bg-slate-950/60 text-slate-100 transition hover:border-sky-300/40 hover:bg-slate-900/80"
                  aria-label="查看日历"
                >
                  <span className="sr-only">查看日历</span>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </a>
                <a
                  href="/growth"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-sky-300/20 bg-slate-950/60 text-slate-100 transition hover:border-sky-300/40 hover:bg-slate-900/80"
                  aria-label="查看成长"
                >
                  <span className="sr-only">查看成长</span>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16" />
                    <path d="M6 16l4-4 3 3 5-7" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/20 bg-slate-950/60 text-slate-100 transition hover:border-sky-300/40 hover:bg-slate-900/80"
                  style={{ touchAction: 'manipulation' }}
                  aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
                >
                  {isFullscreen ? (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
