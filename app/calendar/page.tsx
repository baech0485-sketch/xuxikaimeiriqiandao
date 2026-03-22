'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      .then(data => { if (data.user) setStats(data.user.stats) })
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
    const doneCount = Object.values(record.tasks).filter(t => t.done).length
    return doneCount > 0 ? 'partial' : 'none'
  }

  const statCards = [
    { value: stats.totalStars, label: '总金星', emoji: '⭐', bg: 'from-candy-yellow-light/60 to-candy-yellow-light/30', color: 'text-gray-600' },
    { value: stats.streak, label: '连续天数', emoji: '🔥', bg: 'from-candy-orange-light/60 to-candy-orange-light/30', color: 'text-gray-600' },
    { value: stats.totalDays, label: '总打卡', emoji: '📅', bg: 'from-candy-mint-light/60 to-candy-mint-light/30', color: 'text-gray-600' },
  ]

  return (
    <main className="scene-bg pb-8">
      {/* 云朵 */}
      <div className="cloud top-16 animate-slide-cloud" style={{ opacity: 0.15 }}>☁️</div>

      {/* 顶部 */}
      <header className="sticky top-0 z-30 px-4 py-2">
        <div className="max-w-lg mx-auto bg-white/85 backdrop-blur-xl rounded-2xl shadow-kid px-5 py-2.5 flex items-center justify-between">
          <a href="/" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 transition-colors">
            ←
          </a>
          <h1 className="text-base font-bold text-gray-800">📅 打卡日历</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 relative z-10">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-3 text-center bg-gradient-to-b ${s.bg} shadow-kid`}
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.emoji} {s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 月历 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-kid"
        >
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 active:scale-90 transition-all">
              ←
            </button>
            <h2 className="text-lg font-bold text-gray-700">{year}年{month}月</h2>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 active:scale-90 transition-all">
              →
            </button>
          </div>

          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_LABELS.map(l => (
              <div key={l} className="text-center text-xs text-gray-400 py-1 font-bold">{l}</div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === today

              const styles: Record<string, string> = {
                full: 'bg-candy-mint/50 text-gray-600 shadow-sm',
                partial: 'bg-candy-yellow-light/60 text-gray-500',
                none: 'bg-gray-50/60 text-gray-400',
                future: 'bg-transparent text-gray-200',
              }

              return (
                <motion.button
                  key={day}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                    ${styles[status]}
                    ${isToday ? 'ring-2 ring-candy-blue ring-offset-1' : ''}
                    ${status !== 'future' && status !== 'none' ? 'cursor-pointer active:scale-90' : ''}
                  `}
                  onClick={() => {
                    if (status !== 'future') {
                      const record = getRecordForDay(day)
                      if (record) setSelectedDay(record)
                    }
                  }}
                  whileTap={status !== 'future' ? { scale: 0.88 } : undefined}
                >
                  <span className="text-xs">{day}</span>
                  {status === 'full' && <span className="text-[9px] leading-none">✓</span>}
                </motion.button>
              )
            })}
          </div>

          {/* 图例 */}
          <div className="flex gap-5 justify-center mt-4">
            {[
              { color: 'bg-candy-mint', label: '全勤' },
              { color: 'bg-candy-yellow', label: '部分' },
              { color: 'bg-gray-200', label: '未完成' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 日详情 */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/25 backdrop-blur-sm"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div
              className="relative bg-white rounded-3xl p-6 shadow-kid-lg max-w-sm w-full"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <h3 className="text-lg font-bold text-center text-gray-700 mb-4">
                {selectedDay.date.replace(/-/g, '.')}
                {selectedDay.allCompleted && ' ⭐'}
              </h3>

              <div className="space-y-2">
                {TASKS.map(task => {
                  const t = selectedDay.tasks[task.key]
                  return (
                    <div
                      key={task.key}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                        t?.done ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        t?.done ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {task.emoji}
                      </div>
                      <span className={`flex-grow font-bold text-sm ${t?.done ? 'text-green-600' : 'text-gray-400'}`}>
                        {task.name}
                      </span>
                      {t?.done ? (
                        <span className="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded-full">{t.completedAt}</span>
                      ) : (
                        <span className="text-xs text-gray-300">未完成</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="w-full mt-4 btn-kid bg-gray-100 text-gray-400 text-base"
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
