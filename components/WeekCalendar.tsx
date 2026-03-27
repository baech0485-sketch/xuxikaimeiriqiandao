'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface WeekDay {
  date: string
  label: string
  dayNum: number
  doneCount: number
  totalTasks: number
  status: 'full' | 'partial' | 'none' | 'future'
  isToday: boolean
  starCollected: boolean
}

interface DayRecord {
  date: string
  tasks: Record<string, { done: boolean; completedAt: string | null }>
  allCompleted: boolean
  starCollected?: boolean
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getBeijingToday(): string {
  const now = new Date()
  const beijing = new Date(now.getTime() + 8 * 3600000 + now.getTimezoneOffset() * 60000)
  return beijing.toISOString().split('T')[0]
}

function getMondayDate(todayStr: string): string {
  const d = new Date(`${todayStr}T00:00:00Z`)
  const day = d.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().split('T')[0]
}

function getWeekDates(mondayStr: string): string[] {
  const dates: string[] = []
  const d = new Date(`${mondayStr}T00:00:00Z`)
  for (let i = 0; i < 7; i += 1) {
    const cur = new Date(d)
    cur.setUTCDate(cur.getUTCDate() + i)
    dates.push(cur.toISOString().split('T')[0])
  }
  return dates
}

export default function WeekCalendar({
  refreshKey,
  onCollectStar,
}: {
  refreshKey?: number
  onCollectStar?: (rect: DOMRect, date: string) => void
}) {
  const [records, setRecords] = useState<DayRecord[]>([])

  const today = useMemo(() => getBeijingToday(), [])
  const mondayStr = useMemo(() => getMondayDate(today), [today])
  const weekDates = useMemo(() => getWeekDates(mondayStr), [mondayStr])

  useEffect(() => {
    fetch(`/api/daily/week?_r=${refreshKey ?? 0}&_t=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data.records)) {
          setRecords(data.records)
        }
      })
      .catch(() => {})
  }, [refreshKey])

  const days: WeekDay[] = weekDates.map((dateStr, i) => {
    const record = records.find(r => r.date === dateStr)
    let status: WeekDay['status'] = 'none'
    let doneCount = 0
    let starCollected = false
    const totalTasks = record ? Object.keys(record.tasks || {}).length : 0

    if (dateStr > today) {
      status = 'future'
    } else if (record) {
      doneCount = Object.values(record.tasks || {}).filter(task => task?.done).length
      starCollected = Boolean(record.starCollected)
      status = record.allCompleted ? 'full' : doneCount > 0 ? 'partial' : 'none'
    }

    const dayNum = new Date(`${dateStr}T00:00:00Z`).getUTCDate()
    return { date: dateStr, label: DAY_LABELS[i], dayNum, doneCount, totalTasks, status, isToday: dateStr === today, starCollected }
  })

  const fullCount = days.filter(day => day.status === 'full').length

  return (
    <div className="mission-panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mission-tag mb-3">weekly orbit</div>
          <h3 className="font-display text-2xl font-bold tracking-[0.08em] text-white">本周轨道</h3>
          <p className="mt-2 text-sm text-slate-400">完成整天任务即可点亮一枚星标，未领取的星星会持续闪烁提示。</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <span className="text-emerald-300">●</span>
          <span>{fullCount} 天达标</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {days.map((day, idx) => {
          const isFull = day.status === 'full'
          const isPartial = day.status === 'partial'
          const isFuture = day.status === 'future'
          const progress = day.totalTasks > 0 ? Math.round((day.doneCount / day.totalTasks) * 100) : 0

          return (
            <motion.div
              key={day.date}
              className={`relative overflow-hidden rounded-[24px] border px-4 py-4 ${
                day.isToday
                  ? 'border-sky-300/35 bg-sky-300/8'
                  : isFull
                    ? 'border-emerald-300/20 bg-emerald-400/8'
                    : 'border-white/10 bg-white/[0.03]'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-[0.18em] ${day.isToday ? 'text-sky-200' : 'text-slate-400'}`}>
                  周{day.label}
                </span>
                <span className="font-display text-xl text-white">{day.dayNum}</span>
              </div>

              {isFull ? (
                <button
                  type="button"
                  className={`relative flex w-full flex-col items-start rounded-[20px] border px-4 py-4 text-left transition ${
                    day.starCollected
                      ? 'border-emerald-300/25 bg-emerald-400/12'
                      : 'cursor-pointer border-amber-300/25 bg-amber-300/12 hover:border-amber-200/40 hover:bg-amber-200/14'
                  }`}
                  onClick={event => {
                    if (day.starCollected || !onCollectStar) return
                    onCollectStar(event.currentTarget.getBoundingClientRect(), day.date)
                  }}
                >
                  {!day.starCollected && (
                    <motion.span
                      className="absolute right-3 top-2 text-xs text-amber-200"
                      animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.08, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2, delay: idx * 0.1 }}
                    >
                      ✦
                    </motion.span>
                  )}
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-300">
                    {day.starCollected ? '已归档' : '待领取'}
                  </span>
                  <span className="mt-3 text-3xl text-amber-200">{day.starCollected ? '✓' : '⭐'}</span>
                  <span className="mt-3 text-sm text-white">{day.starCollected ? '星标已回收' : '点击收集星标'}</span>
                </button>
              ) : isPartial ? (
                <div className="rounded-[20px] border border-sky-300/14 bg-slate-950/50 px-4 py-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                    <span>进行中</span>
                    <span>{day.doneCount}/{day.totalTasks}</span>
                  </div>
                  <div className="mission-progress-track h-2.5">
                    <motion.div
                      className="mission-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">继续推进，今天还有任务窗口可以完成。</p>
                </div>
              ) : isFuture ? (
                <div className="rounded-[20px] border border-white/6 bg-slate-950/20 px-4 py-4 text-sm text-slate-500">
                  未来窗口
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-slate-950/35 px-4 py-4 text-sm text-slate-500">
                  尚未点亮
                </div>
              )}

              {day.isToday && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[24px] border border-sky-200/35"
                  animate={{ opacity: [0.35, 0.8, 0.35] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
