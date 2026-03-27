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

  const statCards = [
    { value: stats.totalStars, label: '总星星', accent: 'text-clay-gold' },
    { value: stats.streak, label: '连续天数', accent: 'text-clay-pink' },
    { value: stats.totalDays, label: '总打卡', accent: 'text-clay-mint' },
  ]

  return (
    <main className="scene-bg min-h-[100dvh] overflow-hidden pb-10">
      <div className="clay-bubble left-[-80px] top-[60px] h-[160px] w-[160px] bg-clay-primary/8" />
      <div className="clay-bubble right-[-50px] bottom-[120px] h-[100px] w-[100px] bg-clay-gold/10" />

      <div className="relative z-10 px-4 pt-4 md:px-6">
        <header className="mx-auto max-w-6xl">
          <div className="clay-card px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10"
                  aria-label="返回首页"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </a>
                <div>
                  <div className="clay-tag mb-2">Calendar</div>
                  <h1 className="font-display text-3xl font-bold text-clay-text">打卡日历</h1>
                  <p className="mt-1 text-sm text-clay-text-muted">查看整月任务完成情况，收集更多星星！</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
                {statCards.map(card => (
                  <div key={card.label} className="clay-stat p-4 text-center">
                    <p className={`font-display text-3xl font-bold ${card.accent}`}>{card.value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-clay-text-muted">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-6 grid max-w-6xl gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="clay-card p-5 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10"
                aria-label="查看上个月"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-clay-text-light">Month</p>
                <h2 className="font-display text-3xl font-bold text-clay-text">{year}.{String(month).padStart(2, '0')}</h2>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 text-clay-text shadow-clay-sm transition hover:bg-clay-primary/10"
                aria-label="查看下个月"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 rounded-[24px] border-2 border-white/40 bg-white/20 p-3">
              {WEEKDAY_LABELS.map(label => (
                <div key={label} className="py-2 text-center text-xs font-bold uppercase tracking-widest text-clay-text-muted">
                  {label}
                </div>
              ))}

              {Array.from({ length: firstDay }, (_, offset) => offset + 1).map(fillDay => (
                <div key={`empty-${currentMonth}-${fillDay}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const status = getDayStatus(day)
                const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today
                const record = getRecordForDay(day)
                const doneCount = record ? Object.values(record.tasks).filter(task => task.done).length : 0

                const statusStyle: Record<string, string> = {
                  full: 'border-clay-mint/30 bg-clay-mint-light/60 text-clay-text',
                  partial: 'border-clay-amber/25 bg-clay-amber-light/50 text-clay-text',
                  none: 'border-white/40 bg-white/30 text-clay-text-muted',
                  future: 'border-white/20 bg-transparent text-clay-text-light',
                }

                return (
                  <motion.button
                    type="button"
                    key={day}
                    className={`relative aspect-square rounded-[20px] border-2 p-2 text-left transition ${statusStyle[status]} ${
                      isToday ? 'ring-2 ring-clay-primary/40 ring-offset-1 ring-offset-transparent' : ''
                    } ${status !== 'future' ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-clay-sm' : ''}`}
                    onClick={() => {
                      if (status === 'future') return
                      if (record) setSelectedDay(record)
                    }}
                    whileTap={status !== 'future' ? { scale: 0.95 } : undefined}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <span className="font-display text-xl font-bold">{day}</span>
                      {status === 'full' ? (
                        <span className="text-xs font-bold text-clay-mint">全勤</span>
                      ) : status === 'partial' ? (
                        <span className="text-xs font-bold text-clay-amber">{doneCount}项</span>
                      ) : status === 'none' ? (
                        <span className="text-xs text-clay-text-light">待机</span>
                      ) : null}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="clay-card p-5">
              <div className="clay-tag mb-3">Legend</div>
              <div className="space-y-3">
                {[
                  ['bg-clay-mint-light/60 border-clay-mint/30', '全勤完成，整天任务全部点亮'],
                  ['bg-clay-amber-light/50 border-clay-amber/25', '部分推进，仍可继续补足'],
                  ['bg-white/30 border-white/40', '当天尚未开始记录'],
                ].map(([style, text]) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-clay-text-muted">
                    <div className={`h-5 w-5 rounded-lg border-2 ${style}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="clay-card p-5">
              <div className="clay-tag mb-3">Summary</div>
              <div className="grid gap-3">
                <div className="clay-outline p-4 bg-clay-primary-light/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">本月记录天数</p>
                  <p className="mt-2 font-display text-3xl font-bold text-clay-text">{records.length}</p>
                </div>
                <div className="clay-outline p-4 bg-clay-mint-light/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">全勤天数</p>
                  <p className="mt-2 font-display text-3xl font-bold text-clay-text">{records.filter(record => record.allCompleted).length}</p>
                </div>
                <div className="clay-outline p-4 bg-clay-gold-light/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">星星累计</p>
                  <p className="mt-2 font-display text-3xl font-bold text-clay-text">{records.reduce((sum, record) => sum + (record.starsEarned || 0), 0)}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
              className="absolute inset-0 bg-white/60 backdrop-blur-sm"
              aria-label="关闭当天详情"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div
              className="clay-card relative z-10 w-full max-w-md p-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="calendar-day-title"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-clay-text-light">Daily Detail</p>
                  <h3 id="calendar-day-title" className="mt-2 font-display text-2xl font-bold text-clay-text">
                    {selectedDay.date.replace(/-/g, '.')}
                  </h3>
                </div>
                {selectedDay.allCompleted && <span className="rounded-full border-2 border-clay-gold/30 bg-clay-gold-light px-3 py-1 text-xs font-bold text-clay-amber">全勤</span>}
              </div>

              <div className="space-y-2">
                {TASKS.map(task => {
                  const taskState = selectedDay.tasks[task.key]
                  return (
                    <div
                      key={task.key}
                      className={`flex items-center gap-3 rounded-[22px] border-2 p-3 ${
                        taskState?.done ? 'border-clay-mint/25 bg-clay-mint-light/50' : 'border-white/40 bg-white/30'
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 ${taskState?.done ? 'border-clay-mint/30 bg-clay-mint/10' : 'border-white/40 bg-white/40'}`}>
                        {task.emoji}
                      </div>
                      <span className={`flex-grow text-sm font-bold ${taskState?.done ? 'text-clay-text' : 'text-clay-text-light'}`}>{task.name}</span>
                      {taskState?.done ? (
                        <span className="rounded-full border-2 border-clay-mint/20 bg-clay-mint-light px-2 py-1 text-xs font-bold text-clay-mint">{taskState.completedAt}</span>
                      ) : (
                        <span className="text-xs font-bold text-clay-text-light">未完成</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="mt-5 w-full rounded-2xl border-2 border-white/50 bg-white/50 px-4 py-3 text-sm font-bold text-clay-text-muted shadow-clay-sm transition hover:bg-white/70 active:translate-y-0.5"
              >
                关闭详情
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
