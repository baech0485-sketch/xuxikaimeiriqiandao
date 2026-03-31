'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TASKS } from '@/lib/constants'

interface DayRecord {
  date: string
  tasks: Record<string, { done: boolean; completedAt: string | null }>
  allCompleted: boolean
  fedCount: number
  starsEarned: number
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [records, setRecords] = useState<DayRecord[]>([])
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null)
  const [stats, setStats] = useState({ totalStars: 0, streak: 0, totalDays: 0, maxStreak: 0 })

  useEffect(() => {
    fetch(`/api/daily/history?month=${currentMonth}`)
      .then(r => r.json())
      .then(data => setRecords(data.records || []))
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data.user) setStats(data.user.stats)
      })
  }, [currentMonth])

  const [year, month] = currentMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const nextMonth = () => {
    const d = new Date(year, month, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const getRecordForDay = (day: number) => {
    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
    return records.find(r => r.date === dateStr)
  }

  const getDayStatus = (day: number) => {
    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
    if (dateStr > today) return 'future'
    const record = getRecordForDay(day)
    if (!record) return 'none'
    if (record.allCompleted) return 'full'
    const doneCount = Object.values(record.tasks).filter(task => task.done).length
    return doneCount > 0 ? 'partial' : 'none'
  }

  const fullDays = records.filter(r => r.allCompleted).length

  return (
    <main className="min-h-[100dvh] bg-duo-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b-2 border-duo-border bg-duo-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-duo-border text-duo-text-secondary transition hover:bg-duo-bg"
              aria-label="返回首页"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <h1 className="font-display text-xl font-bold text-duo-text">打卡日历</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-duo-yellow/20 px-3 py-1.5">
              <span className="text-base">&#11088;</span>
              <span className="text-sm font-bold text-duo-text">{stats.totalStars}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-duo-orange/10 px-3 py-1.5">
              <span className="text-base">&#128293;</span>
              <span className="text-sm font-bold text-duo-orange">{stats.streak}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* 日历主体 */}
          <section className="clay-card p-5">
            {/* 月份选择器 */}
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-duo-border text-duo-text-secondary transition hover:bg-duo-bg"
                aria-label="上个月"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-duo-text">{year}年{month}月</p>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-duo-border text-duo-text-secondary transition hover:bg-duo-bg"
                aria-label="下个月"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* 星期头部 */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map(label => (
                <div key={label} className="py-2 text-center text-xs font-bold text-duo-text-secondary">
                  {label}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const status = getDayStatus(day)
                const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today
                const record = getRecordForDay(day)
                const doneCount = record ? Object.values(record.tasks).filter(task => task.done).length : 0

                return (
                  <motion.button
                    type="button"
                    key={day}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-1 transition ${
                      status === 'full'
                        ? 'border-duo-green/30 bg-duo-green-light'
                        : status === 'partial'
                          ? 'border-duo-orange/30 bg-duo-orange/10'
                          : status === 'future'
                            ? 'border-transparent bg-transparent'
                            : 'border-duo-border bg-duo-surface'
                    } ${isToday ? 'ring-2 ring-duo-green ring-offset-1' : ''} ${
                      status !== 'future' ? 'cursor-pointer hover:bg-duo-bg' : ''
                    }`}
                    onClick={() => {
                      if (status === 'future') return
                      if (record) setSelectedDay(record)
                    }}
                    whileTap={status !== 'future' ? { scale: 0.95 } : undefined}
                  >
                    <span className={`font-display text-lg font-bold ${
                      status === 'future' ? 'text-duo-text-light' : 'text-duo-text'
                    }`}>
                      {day}
                    </span>
                    {status === 'full' && (
                      <span className="text-xs text-duo-green">&#10003;</span>
                    )}
                    {status === 'partial' && (
                      <span className="text-[10px] text-duo-orange">{doneCount}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </section>

          {/* 侧边栏统计 */}
          <aside className="space-y-4">
            {/* 月度统计 */}
            <div className="clay-card p-5">
              <h3 className="mb-4 font-display text-lg font-bold text-duo-text">本月统计</h3>
              <div className="space-y-3">
                <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-4">
                  <p className="text-sm text-duo-text-secondary">记录天数</p>
                  <p className="mt-1 font-display text-2xl font-bold text-duo-text">{records.length}</p>
                </div>
                <div className="rounded-xl border-2 border-duo-green/30 bg-duo-green-light p-4">
                  <p className="text-sm text-duo-green-dark">全勤天数</p>
                  <p className="mt-1 font-display text-2xl font-bold text-duo-green">{fullDays}</p>
                </div>
                <div className="rounded-xl border-2 border-duo-yellow/30 bg-duo-yellow/10 p-4">
                  <p className="text-sm text-duo-text-secondary">收集星星</p>
                  <p className="mt-1 font-display text-2xl font-bold text-duo-text">
                    {records.reduce((sum, r) => sum + (r.starsEarned || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* 图例 */}
            <div className="clay-card p-5">
              <h3 className="mb-4 font-display text-lg font-bold text-duo-text">图例说明</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-duo-green/30 bg-duo-green-light" />
                  <span className="text-duo-text-secondary">全勤完成</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-duo-orange/30 bg-duo-orange/10" />
                  <span className="text-duo-text-secondary">部分完成</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-duo-border bg-duo-surface" />
                  <span className="text-duo-text-secondary">尚未开始</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 日期详情弹窗 */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-duo-text/20 backdrop-blur-sm"
              aria-label="关闭详情"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border-2 border-duo-border bg-duo-surface p-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-duo-text-secondary">任务详情</p>
                  <h3 className="mt-1 font-display text-xl font-bold text-duo-text">
                    {selectedDay.date.replace(/-/g, '.')}
                  </h3>
                </div>
                {selectedDay.allCompleted && (
                  <span className="rounded-full bg-duo-green-light px-3 py-1 text-xs font-bold text-duo-green">
                    全勤
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {TASKS.map(task => {
                  const taskState = selectedDay.tasks[task.key]
                  return (
                    <div
                      key={task.key}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                        taskState?.done
                          ? 'border-duo-green/20 bg-duo-green-light'
                          : 'border-duo-border bg-duo-surface'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        taskState?.done ? 'bg-duo-green/20' : 'bg-duo-bg'
                      }`}>
                        {task.emoji}
                      </div>
                      <span className={`flex-grow text-sm font-bold ${
                        taskState?.done ? 'text-duo-text' : 'text-duo-text-light'
                      }`}>
                        {task.name}
                      </span>
                      {taskState?.done ? (
                        <span className="text-xs text-duo-green">{taskState.completedAt}</span>
                      ) : (
                        <span className="text-xs text-duo-text-light">未完成</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="mt-5 w-full rounded-xl border-2 border-duo-border bg-duo-bg py-3 text-sm font-bold text-duo-text-secondary transition hover:bg-duo-surface"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
