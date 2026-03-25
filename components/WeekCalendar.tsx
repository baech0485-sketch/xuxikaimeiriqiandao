'use client'

import { useEffect, useState, useMemo } from 'react'

interface WeekDay {
  date: string
  label: string
  dayNum: number
  status: 'full' | 'partial' | 'none' | 'future'
  isToday: boolean
}

interface DayRecord {
  date: string
  tasks: Record<string, { done: boolean; completedAt: string | null }>
  allCompleted: boolean
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 获取北京时间的今日日期字符串 */
function getBeijingToday(): string {
  const now = new Date()
  const beijing = new Date(now.getTime() + 8 * 3600000 + now.getTimezoneOffset() * 60000)
  return beijing.toISOString().split('T')[0]
}

/** 根据北京日期计算本周一的日期字符串 */
function getMondayDate(todayStr: string): string {
  const d = new Date(todayStr + 'T00:00:00Z')
  const day = d.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().split('T')[0]
}

/** 基于 UTC 生成本周7天的日期字符串列表 */
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

export default function WeekCalendar({ refreshKey }: { refreshKey?: number }) {
  const [records, setRecords] = useState<DayRecord[]>([])

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
      .catch(() => { /* API 失败时仍展示空状态日历 */ })
  }, [refreshKey])

  const days: WeekDay[] = weekDates.map((dateStr, i) => {
    const record = records.find(r => r.date === dateStr)
    let status: WeekDay['status'] = 'none'
    if (dateStr > today) {
      status = 'future'
    } else if (record) {
      if (record.allCompleted) {
        status = 'full'
      } else {
        const doneCount = Object.values(record.tasks || {}).filter((t: any) => t?.done).length
        status = doneCount > 0 ? 'partial' : 'none'
      }
    }
    const dayNum = new Date(dateStr + 'T00:00:00Z').getUTCDate()
    return { date: dateStr, label: DAY_LABELS[i], dayNum, status, isToday: dateStr === today }
  })

  return (
    <div className="card-kid">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📅</span>
          <span className="text-sm font-bold text-gray-500">本周打卡</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-candy-mint" />达标</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-candy-yellow" />进行中</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-200 border border-dashed border-gray-300" />未打卡</span>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {days.map(day => {
          const isFull = day.status === 'full'
          const isPartial = day.status === 'partial'
          const isNone = day.status === 'none'
          const isFuture = day.status === 'future'

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
              {/* 星期标签 */}
              <span className={`text-xs font-bold ${
                day.isToday ? 'text-candy-blue' : 'text-gray-400'
              }`}>
                {day.label}
              </span>

              {/* 日期方块 */}
              <div
                className={`w-full aspect-square max-w-[46px] rounded-2xl flex flex-col items-center justify-center transition-all
                  ${isFull
                    ? 'bg-candy-mint text-white shadow-md'
                    : isPartial
                    ? 'bg-candy-yellow/70 text-gray-600 shadow-sm'
                    : isNone
                    ? 'bg-white border-2 border-dashed border-gray-200 text-gray-300'
                    : 'bg-gray-50/30 text-gray-200'
                  }
                  ${day.isToday ? 'ring-2 ring-candy-blue ring-offset-2' : ''}
                `}
              >
                {isFull ? (
                  <span className="text-base">✅</span>
                ) : isPartial ? (
                  <span className="text-base">🔸</span>
                ) : isNone ? (
                  <span className="text-lg leading-none">✗</span>
                ) : (
                  <span className="text-xs">{day.dayNum}</span>
                )}
              </div>

              {/* 今天标记 */}
              {day.isToday && (
                <span className="text-[10px] font-bold text-candy-blue leading-none">今天</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
