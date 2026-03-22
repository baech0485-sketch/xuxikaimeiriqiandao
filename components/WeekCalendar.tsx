'use client'

import { useEffect, useState } from 'react'

interface WeekDay {
  date: string
  label: string
  dayNum: number
  status: 'full' | 'partial' | 'none' | 'future'
  isToday: boolean
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function WeekCalendar({ refreshKey }: { refreshKey?: number }) {
  const [days, setDays] = useState<WeekDay[]>([])

  useEffect(() => {
    fetch('/api/daily/week')
      .then(r => r.json())
      .then(data => {
        const { records, startDate, today } = data
        if (!startDate) return
        const weekDays: WeekDay[] = []
        const start = new Date(startDate)
        for (let i = 0; i < 7; i++) {
          const d = new Date(start)
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().split('T')[0]
          const record = records?.find((r: any) => r.date === dateStr)
          let status: WeekDay['status'] = 'none'
          if (dateStr > today) { status = 'future' }
          else if (record) {
            if (record.allCompleted) { status = 'full' }
            else {
              const doneCount = Object.values(record.tasks).filter((t: any) => t.done).length
              status = doneCount > 0 ? 'partial' : 'none'
            }
          }
          weekDays.push({ date: dateStr, label: DAY_LABELS[i], dayNum: d.getDate(), status, isToday: dateStr === today })
        }
        setDays(weekDays)
      })
  }, [refreshKey])

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
