'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface WeekDay {
  date: string
  label: string
  dayNum: number
  doneCount: number
  totalTasks: number
  status: 'full' | 'partial' | 'none' | 'future'
  isToday: boolean
}

interface DayRecord {
  date: string
  tasks: Record<string, { done: boolean; completedAt: string | null }>
  allCompleted: boolean
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getBeijingToday(): string {
  const now = new Date()
  const beijing = new Date(now.getTime() + 8 * 3600000 + now.getTimezoneOffset() * 60000)
  return beijing.toISOString().split('T')[0]
}

function getMondayDate(todayStr: string): string {
  const d = new Date(todayStr + 'T00:00:00Z')
  const day = d.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().split('T')[0]
}

function getWeekDates(mondayStr: string): string[] {
  const dates: string[] = []
  const d = new Date(mondayStr + 'T00:00:00Z')
  for (let i = 0; i < 7; i++) {
    const cur = new Date(d)
    cur.setUTCDate(cur.getUTCDate() + i)
    dates.push(cur.toISOString().split('T')[0])
  }
  return dates
}

export default function WeekCalendar({ refreshKey, onCollectStar }: { refreshKey?: number; onCollectStar?: (rect: DOMRect) => void }) {
  const [records, setRecords] = useState<DayRecord[]>([])
  const [collected, setCollected] = useState<Set<string>>(new Set())

  const today = useMemo(() => getBeijingToday(), [])
  const mondayStr = useMemo(() => getMondayDate(today), [today])
  const weekDates = useMemo(() => getWeekDates(mondayStr), [mondayStr])

  useEffect(() => {
    fetch('/api/daily/week')
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
    const totalTasks = record ? Object.keys(record.tasks || {}).length : 0
    if (dateStr > today) {
      status = 'future'
    } else if (record) {
      doneCount = Object.values(record.tasks || {}).filter((t: any) => t?.done).length
      if (record.allCompleted) {
        status = 'full'
      } else {
        status = doneCount > 0 ? 'partial' : 'none'
      }
    }
    const dayNum = new Date(dateStr + 'T00:00:00Z').getUTCDate()
    return { date: dateStr, label: DAY_LABELS[i], dayNum, doneCount, totalTasks, status, isToday: dateStr === today }
  })

  const fullCount = days.filter(d => d.status === 'full').length

  return (
    <div className="card-kid overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-candy-blue/20 to-candy-mint/20 flex items-center justify-center">
            <span className="text-sm">📅</span>
          </div>
          <span className="text-sm font-bold text-gray-600">本周打卡</span>
          {fullCount > 0 && (
            <span className="text-[11px] bg-candy-mint/15 text-candy-mint px-2 py-0.5 rounded-full font-bold">
              {fullCount}天达标
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-candy-mint to-emerald-400" />
            达标
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-candy-yellow to-amber-400" />
            进行中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-200" />
            未打卡
          </span>
        </div>
      </div>

      {/* 周历网格 */}
      <div className="flex justify-between gap-1.5">
        {days.map((day, idx) => {
          const isFull = day.status === 'full'
          const isPartial = day.status === 'partial'
          const isNone = day.status === 'none'
          const isFuture = day.status === 'future'

          return (
            <motion.div
              key={day.date}
              className="flex flex-col items-center gap-1 flex-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              {/* 星期标签 */}
              <span className={`text-[11px] font-bold ${
                day.isToday ? 'text-candy-blue' : 'text-gray-400'
              }`}>
                {day.label}
              </span>

              {/* 日期圆形 */}
              <div className="relative">
                {/* 达标状态 - 渐变圆 + 星星 */}
                {isFull && (
                  <motion.div
                    className={`relative ${collected.has(day.date) ? '' : 'cursor-pointer'}`}
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: idx * 0.05 }}
                    onClick={(e) => {
                      if (collected.has(day.date) || !onCollectStar) return
                      const rect = e.currentTarget.getBoundingClientRect()
                      setCollected(prev => new Set(prev).add(day.date))
                      onCollectStar(rect)
                    }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {/* 柔和外发光 - 未收集时脉动提示 */}
                    <motion.div
                      className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-candy-yellow/25 to-candy-mint/30 blur-md"
                      animate={collected.has(day.date)
                        ? { opacity: 0.3, scale: 1 }
                        : { opacity: [0.4, 0.75, 0.4], scale: [0.95, 1.08, 0.95] }
                      }
                      transition={collected.has(day.date)
                        ? {}
                        : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                      }
                    />
                    {/* 闪光装饰 - 未收集时闪烁 */}
                    {!collected.has(day.date) && (
                      <motion.span
                        className="absolute -top-1 -right-1 text-[9px] z-20 pointer-events-none"
                        animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.2, 0.85, 0.2], rotate: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, delay: idx * 0.15 }}
                      >
                        ✨
                      </motion.span>
                    )}
                    {/* 主徽章 */}
                    <div className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center ring-[2.5px] ring-white/70 ring-offset-0 transition-all ${
                      collected.has(day.date)
                        ? 'bg-gradient-to-br from-candy-mint/60 to-teal-300/60 shadow-[0_2px_8px_rgba(139,197,160,0.3)]'
                        : 'bg-gradient-to-br from-emerald-300 via-candy-mint to-teal-400 shadow-[0_3px_14px_rgba(139,197,160,0.5)]'
                    }`}>
                      {/* 玻璃高光 */}
                      <div className="absolute top-[2px] left-[15%] right-[15%] h-[38%] rounded-full bg-white/30 blur-[0.5px]" />
                      {/* 图标 */}
                      <span className="relative z-10 text-[15px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                        {collected.has(day.date) ? '✓' : '⭐'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* 进行中状态 - 环形进度 */}
                {isPartial && (
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-candy-yellow/30 to-amber-100 flex items-center justify-center relative">
                    {/* 进度环 */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="19" fill="none" stroke="#E8D48A" strokeWidth="2.5" strokeOpacity="0.3" />
                      <circle
                        cx="22" cy="22" r="19" fill="none"
                        stroke="url(#progressGrad)" strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={`${(day.doneCount / Math.max(day.totalTasks, 1)) * 119.4} 119.4`}
                      />
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="44" y2="44">
                          <stop stopColor="#E8D48A" />
                          <stop offset="1" stopColor="#D4A040" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-xs font-bold text-amber-600 relative z-10">
                      {day.doneCount}
                    </span>
                  </div>
                )}

                {/* 未打卡状态 */}
                {isNone && (
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-300">{day.dayNum}</span>
                  </div>
                )}

                {/* 未来状态 */}
                {isFuture && (
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gray-50/50 flex items-center justify-center">
                    <span className="text-sm text-gray-200 font-bold">{day.dayNum}</span>
                  </div>
                )}

                {/* 今天指示环 */}
                {day.isToday && (
                  <motion.div
                    className="absolute -inset-[3px] rounded-full border-2 border-candy-blue/50"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  />
                )}
              </div>

              {/* 底部标注 */}
              {day.isToday ? (
                <span className="text-[10px] font-bold text-candy-blue leading-none">今天</span>
              ) : isFull ? (
                <motion.span
                  className="text-[10px] font-bold text-emerald-500 leading-none"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.2 }}
                >
                  {day.dayNum}日
                </motion.span>
              ) : (
                <span className="text-[10px] text-gray-300 leading-none h-3" />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
