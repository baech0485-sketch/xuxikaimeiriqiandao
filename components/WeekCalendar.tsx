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
      {/* 标题区域 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-orange/10 text-xl">
            &#128293;
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-duo-text">本周记录</h3>
            <p className="text-sm text-duo-text-secondary">完成每日任务收集星星</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-duo-yellow/20 px-3 py-1.5">
          <span className="text-base">&#11088;</span>
          <span className="text-sm font-bold text-duo-text">{fullCount}</span>
        </div>
      </div>

      {/* 周历格子 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isFull = day.status === 'full'
          const isPartial = day.status === 'partial'
          const isFuture = day.status === 'future'
          const progress = day.totalTasks > 0 ? Math.round((day.doneCount / day.totalTasks) * 100) : 0

          return (
            <motion.button
              key={day.date}
              type="button"
              disabled={isFuture || day.starCollected || !isFull}
              className={`relative flex flex-col items-center rounded-xl p-2 transition-all ${
                day.isToday
                  ? 'border-2 border-duo-green bg-duo-green-light'
                  : isFull && !day.starCollected
                    ? 'border-2 border-duo-yellow bg-duo-yellow/10 cursor-pointer hover:bg-duo-yellow/20'
                    : isFull && day.starCollected
                      ? 'border-2 border-duo-green/30 bg-duo-green-light/50'
                      : isPartial
                        ? 'border-2 border-duo-orange/30 bg-duo-orange/5'
                        : 'border-2 border-duo-border bg-duo-surface'
              } ${isFuture ? 'opacity-40' : ''}`}
              onClick={event => {
                if (isFull && !day.starCollected && onCollectStar) {
                  onCollectStar(event.currentTarget.getBoundingClientRect(), day.date)
                }
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
            >
              {/* 星期标签 */}
              <span className={`text-xs font-bold ${
                day.isToday ? 'text-duo-green' : 'text-duo-text-secondary'
              }`}>
                {day.label}
              </span>

              {/* 日期数字 */}
              <span className={`mt-1 font-display text-lg font-bold ${
                day.isToday ? 'text-duo-green' : isFull ? 'text-duo-text' : 'text-duo-text-secondary'
              }`}>
                {day.dayNum}
              </span>

              {/* 状态指示器 */}
              <div className="mt-1.5 flex h-6 w-6 items-center justify-center">
                {isFull ? (
                  day.starCollected ? (
                    <span className="text-lg text-duo-green">&#10003;</span>
                  ) : (
                    <motion.span 
                      className="text-lg"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      &#11088;
                    </motion.span>
                  )
                ) : isPartial ? (
                  <div className="h-1.5 w-full max-w-[20px] rounded-full bg-duo-border overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-duo-orange"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : isFuture ? (
                  <span className="text-duo-text-light">-</span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-duo-border" />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-duo-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">&#11088;</span>
          <span>可收集</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-duo-green">&#10003;</span>
          <span>已收集</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-4 rounded-full bg-duo-orange" />
          <span>进行中</span>
        </div>
      </div>
    </div>
  )
}
