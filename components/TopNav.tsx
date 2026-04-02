'use client'

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
}: TopNavProps) {
  const progress = Math.min((completedCount / dailyGoal) * 100, 100)

  return (
    <header className="sticky top-0 z-30 border-b-2 border-duo-border bg-duo-surface">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + 应用名 */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-green text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-duo-text">
                {childName ? `${childName} 小宠伴学` : '徐熙凯 小宠伴学'}
              </h1>
            </div>
          </div>

          {/* 中间进度条 (桌面端) */}
          <div className="hidden flex-1 max-w-md mx-8 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-4 rounded-full bg-duo-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-duo-green to-[#7CD81A]"
                  style={{ boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-bold text-duo-text-secondary whitespace-nowrap">
                {completedCount}/{dailyGoal}
              </span>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 待投喂 */}
            {canFeedCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-duo-orange/10 px-3 py-1.5">
                <span className="text-base">&#127828;</span>
                <span className="text-sm font-bold text-duo-orange">{canFeedCount}</span>
              </div>
            )}

            {/* 连续打卡火焰 */}
            <div className="flex items-center gap-1.5 rounded-full bg-duo-orange/10 px-3 py-1.5">
              <span className="text-base">&#128293;</span>
              <span className="text-sm font-bold text-duo-orange">{streak}</span>
            </div>

            {/* 星星计数器 */}
            <motion.div
              id="star-counter"
              className="flex items-center gap-1.5 rounded-full bg-duo-yellow/20 px-3 py-1.5"
              animate={starBounce ? { scale: [1, 1.2, 0.95, 1.05, 1] } : {}}
              transition={starBounce ? { duration: 0.5, ease: 'easeOut' } : {}}
            >
              <span className="text-base">&#11088;</span>
              <span className="text-sm font-bold text-duo-text">{totalStars}</span>
            </motion.div>

            {/* 生命值（食物数量） */}
            <div className="hidden sm:flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-base ${i < Math.min(canFeedCount + 3, 5) ? 'opacity-100' : 'opacity-30 grayscale'}`}
                >
                  &#10084;&#65039;
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 移动端进度条 */}
        <div className="mt-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-duo-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-duo-green to-[#7CD81A]"
                style={{ boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-bold text-duo-text-secondary">
              {completedCount}/{dailyGoal}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
