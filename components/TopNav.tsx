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
        <div className="clay-card px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border-3 border-white/60 bg-gradient-to-br from-clay-primary/20 to-clay-pink/20 shadow-clay-sm">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <div className="clay-tag mb-2">Habit Buddy</div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-clay-text md:text-3xl">
                  小宠伴学
                </h1>
                <p className="mt-1 text-sm text-clay-text-muted">
                  {childName ? `${childName} 的学习小天地` : '今日任务已启动'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
              <motion.div
                id="star-counter"
                className="clay-stat min-w-[116px] px-4 py-3"
                animate={starBounce ? { scale: [1, 1.18, 0.92, 1.06, 1] } : {}}
                transition={starBounce ? { duration: 0.5, ease: 'easeOut' } : {}}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-clay-text-muted">星星储备</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg text-clay-gold">&#11088;</span>
                  <span className="font-display text-2xl font-bold text-clay-text">{totalStars}</span>
                </div>
              </motion.div>

              <div className="clay-stat min-w-[116px] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-clay-text-muted">连续打卡</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg text-clay-pink">&#128293;</span>
                  <span className="font-display text-2xl font-bold text-clay-text">{streak}</span>
                  <span className="text-sm text-clay-text-muted">天</span>
                </div>
              </div>

              <div className="clay-stat min-w-[116px] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-clay-text-muted">任务进度</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-clay-text">{completedCount}</span>
                  <span className="text-sm text-clay-text-muted">/ {dailyGoal}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-clay-mint">{moodLabel} · {canFeedCount} 份食物待投喂</p>
              </div>

              <div className="flex items-center gap-2 md:justify-end lg:justify-start">
                <a
                  href="/calendar"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10 hover:border-clay-primary/30"
                  aria-label="查看日历"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </a>
                <a
                  href="/growth"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10 hover:border-clay-primary/30"
                  aria-label="查看成长"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16" />
                    <path d="M6 16l4-4 3 3 5-7" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10 hover:border-clay-primary/30"
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
