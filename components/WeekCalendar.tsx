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
    <div className="clay-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="clay-tag mb-3">Weekly</div>
          <h3 className="font-display text-2xl font-bold text-clay-text">本周记录</h3>
          <p className="mt-2 text-sm text-clay-text-muted">完成整天任务即可收集一颗星星！</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border-2 border-clay-mint/20 bg-clay-mint-light px-4 py-2 text-sm font-bold text-clay-mint">
          <span>&#11088;</span>
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
              className={`relative overflow-hidden rounded-[24px] border-2 px-4 py-4 ${
                day.isToday
                  ? 'border-clay-primary/35 bg-clay-primary-light/50 shadow-clay-sm'
                  : isFull
                    ? 'border-clay-gold/30 bg-clay-gold-light/50 shadow-clay-sm'
                    : 'border-white/50 bg-white/40'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest ${day.isToday ? 'text-clay-primary' : 'text-clay-text-muted'}`}>
                  周{day.label}
                </span>
                <span className="font-display text-xl font-bold text-clay-text">{day.dayNum}</span>
              </div>

              {isFull ? (
                <button
                  type="button"
                  className={`relative flex w-full flex-col items-start rounded-[20px] border-2 px-4 py-4 text-left transition ${
                    day.starCollected
                      ? 'border-clay-mint/30 bg-clay-mint-light/60'
                      : 'cursor-pointer border-clay-gold/30 bg-clay-gold-light hover:border-clay-gold/50 hover:shadow-clay-sm'
                  }`}
                  onClick={event => {
                    if (day.starCollected || !onCollectStar) return
                    onCollectStar(event.currentTarget.getBoundingClientRect(), day.date)
                  }}
                >
                  {!day.starCollected && (
                    <motion.span
                      className="absolute right-3 top-2 text-xs text-clay-gold"
                      animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.08, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2, delay: idx * 0.1 }}
                    >
                      &#10024;
                    </motion.span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">
                    {day.starCollected ? '已收集' : '待领取'}
                  </span>
                  <span className="mt-3 text-3xl">{day.starCollected ? '&#10003;' : '&#11088;'}</span>
                  <span className="mt-3 text-sm font-bold text-clay-text">{day.starCollected ? '星星已收集' : '点击收集星星'}</span>
                </button>
              ) : isPartial ? (
                <div className="rounded-[20px] border-2 border-clay-amber/20 bg-clay-amber-light/40 px-4 py-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold text-clay-text-muted">
                    <span>进行中</span>
                    <span>{day.doneCount}/{day.totalTasks}</span>
                  </div>
                  <div className="clay-progress-track h-2.5">
                    <motion.div
                      className="clay-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-clay-text-muted">继续加油，今天还有任务可以完成！</p>
                </div>
              ) : isFuture ? (
                <div className="rounded-[20px] border-2 border-dashed border-white/40 bg-white/20 px-4 py-4 text-sm text-clay-text-light">
                  还没到哦
                </div>
              ) : (
                <div className="rounded-[20px] border-2 border-dashed border-white/40 bg-white/20 px-4 py-4 text-sm text-clay-text-light">
                  尚未开始
                </div>
              )}

              {day.isToday && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[24px] border-2 border-clay-primary/30"
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
