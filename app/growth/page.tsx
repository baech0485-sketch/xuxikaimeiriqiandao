'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface GrowthRecord {
  _id: string
  date: string
  height: number
  weight: number
}

function calcAge(birthday: string): string {
  if (!birthday) return ''
  const birth = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (now.getDate() < birth.getDate()) {
    months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
  }
  return `${years}岁${months}个月`
}

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${parseInt(month, 10)}/${parseInt(day, 10)}`
}

const inputClassName =
  'w-full rounded-2xl border-2 border-clay-primary/15 bg-white/60 px-4 py-3 text-sm text-clay-text outline-none transition placeholder:text-clay-text-light focus:border-clay-primary/35 focus:bg-white/80 shadow-clay-sm'

export default function GrowthPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [userName, setUserName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/growth')
      .then(r => r.json())
      .then(data => {
        setRecords(data.records || [])
        if (data.user) {
          setUserName(data.user.name || '')
          setBirthday(data.user.birthday || '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const latest = records.length > 0 ? records[records.length - 1] : null
  const age = useMemo(() => calcAge(birthday), [birthday])

  const chartData = useMemo(
    () =>
      records.map(record => ({
        date: formatDate(record.date),
        fullDate: record.date,
        身高: record.height,
        体重: record.weight,
      })),
    [records],
  )

  const handleSubmit = async () => {
    if (!height || !weight || !date) return
    setSubmitting(true)
    const res = await fetch('/api/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        height: parseFloat(height),
        weight: parseFloat(weight),
        birthday: birthday || undefined,
      }),
    })
    const data = await res.json()
    if (data.records) setRecords(data.records)
    setHeight('')
    setWeight('')
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/growth?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.records) setRecords(data.records)
    setDeleteId(null)
  }

  if (loading) {
    return (
      <main className="scene-bg flex min-h-[100dvh] items-center justify-center">
        <div className="clay-bubble left-[10%] top-[20%] h-[100px] w-[100px] bg-clay-pink/10" />
        <motion.div className="clay-card p-8 text-center" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <p className="font-display text-xl text-clay-text">加载中...</p>
          <p className="mt-2 text-sm text-clay-text-muted">正在准备成长数据...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="scene-bg min-h-[100dvh] overflow-hidden pb-10">
      <div className="clay-bubble right-[-60px] top-[80px] h-[160px] w-[160px] bg-clay-pink/10" />
      <div className="clay-bubble left-[-40px] bottom-[120px] h-[100px] w-[100px] bg-clay-primary/8" />

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
                  <div className="clay-tag mb-2">Growth</div>
                  <h1 className="font-display text-3xl font-bold text-clay-text">成长记录</h1>
                  <p className="mt-1 text-sm text-clay-text-muted">记录身高与体重变化，见证每一步成长。</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[380px]">
                {[
                  { value: latest ? `${latest.height}cm` : '--', label: '最新身高', accent: 'text-clay-primary' },
                  { value: latest ? `${latest.weight}kg` : '--', label: '最新体重', accent: 'text-clay-pink' },
                  { value: age || '--', label: '年龄', accent: 'text-clay-amber' },
                ].map(card => (
                  <div key={card.label} className="clay-stat p-4 text-center">
                    <p className={`font-display text-2xl font-bold ${card.accent}`}>{card.value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-clay-text-muted">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-6 grid max-w-6xl gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <section className="flex flex-col gap-6">
            <div className="clay-card p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <div className="clay-tag mb-3">Record</div>
                  <h2 className="font-display text-2xl font-bold text-clay-text">登记新记录</h2>
                </div>
                <span className="text-sm text-clay-text-light">{userName ? `${userName} 的成长档案` : '成长档案'}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-clay-text-muted">记录日期</span>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-clay-text-muted">出生日期 {age ? `· ${age}` : ''}</span>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-clay-text-muted">身高 cm</span>
                  <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="120.5" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-clay-text-muted">体重 kg</span>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="22.3" className={inputClassName} />
                </label>
              </div>

              <motion.button
                type="button"
                className={`mt-5 w-full rounded-2xl border-3 px-4 py-4 text-base font-bold transition ${
                  height && weight && date
                    ? 'border-clay-primary/30 bg-gradient-to-r from-clay-primary/15 via-clay-pink/12 to-clay-amber/10 text-clay-text shadow-clay-sm active:translate-y-0.5 active:shadow-clay-pressed'
                    : 'cursor-not-allowed border-white/30 bg-white/20 text-clay-text-light'
                }`}
                onClick={handleSubmit}
                disabled={!height || !weight || !date || submitting}
                whileTap={height && weight && date ? { scale: 0.98 } : undefined}
              >
                {submitting ? '保存中...' : '保存记录'}
              </motion.button>
            </div>

            <div className="clay-card p-5 md:p-6">
              <div className="clay-tag mb-3">History</div>
              {records.length > 0 ? (
                <div className="space-y-2">
                  {[...records].reverse().map(record => (
                    <div key={record._id} className="flex items-center gap-3 rounded-[22px] border-2 border-white/50 bg-white/40 p-3 shadow-clay-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/60 text-center text-xs font-bold text-clay-text-muted">
                        {new Date(`${record.date}T00:00:00`).getDate()}日
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs text-clay-text-light">{record.date.replace(/-/g, '.')}</p>
                        <div className="mt-1 flex gap-4">
                          <span className="text-sm font-bold text-clay-primary">身高 {record.height}cm</span>
                          <span className="text-sm font-bold text-clay-pink">体重 {record.weight}kg</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-red-200/40 bg-red-50 text-red-400 transition hover:bg-red-100"
                        onClick={() => setDeleteId(record._id)}
                        aria-label={`删除 ${record.date} 的成长记录`}
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-white/40 bg-white/20 px-4 py-10 text-center">
                  <p className="font-display text-3xl text-clay-text-light">暂无数据</p>
                  <p className="mt-2 text-sm text-clay-text-muted">还没有成长记录，先在上方登记第一条。</p>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="clay-card p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <div className="clay-tag mb-3">Trend</div>
                  <h2 className="font-display text-2xl font-bold text-clay-text">成长趋势图</h2>
                </div>
                <span className="text-sm text-clay-text-light">至少两条记录后显示</span>
              </div>

              {records.length >= 2 ? (
                <div className="space-y-6">
                  <div className="rounded-[24px] border-2 border-white/50 bg-white/30 p-4 shadow-clay-sm">
                    <p className="mb-3 text-sm font-bold text-clay-primary">身高变化</p>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,106,239,0.1)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7B6F8E' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#7B6F8E' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: '2px solid rgba(124,106,239,0.15)',
                              background: 'rgba(255,255,255,0.95)',
                              color: '#2D1B69',
                              boxShadow: '8px 8px 20px rgba(0,0,0,0.08)',
                              fontSize: 13,
                            }}
                            formatter={value => [`${value} cm`, '身高']}
                            labelFormatter={label => `日期 ${label}`}
                          />
                          <Line type="monotone" dataKey="身高" stroke="#7C6AEF" strokeWidth={3} dot={{ fill: '#7C6AEF', r: 4 }} activeDot={{ r: 6, stroke: '#7C6AEF', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[24px] border-2 border-white/50 bg-white/30 p-4 shadow-clay-sm">
                    <p className="mb-3 text-sm font-bold text-clay-pink">体重变化</p>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,143,171,0.1)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7B6F8E' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11, fill: '#7B6F8E' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: '2px solid rgba(255,143,171,0.15)',
                              background: 'rgba(255,255,255,0.95)',
                              color: '#2D1B69',
                              boxShadow: '8px 8px 20px rgba(0,0,0,0.08)',
                              fontSize: 13,
                            }}
                            formatter={value => [`${value} kg`, '体重']}
                            labelFormatter={label => `日期 ${label}`}
                          />
                          <Line type="monotone" dataKey="体重" stroke="#FF8FAB" strokeWidth={3} dot={{ fill: '#FF8FAB', r: 4 }} activeDot={{ r: 6, stroke: '#FF8FAB', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-white/40 bg-white/20 px-4 py-16 text-center">
                  <p className="font-display text-3xl text-clay-text-light">等待数据</p>
                  <p className="mt-2 text-sm text-clay-text-muted">至少保存两条记录后，趋势图会自动生成。</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="关闭删除确认"
              className="absolute inset-0 bg-white/60 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              className="clay-card relative z-10 w-full max-w-xs p-6 text-center"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="growth-delete-title"
            >
              <p id="growth-delete-title" className="font-display text-2xl font-bold text-clay-text">删除这条记录？</p>
              <p className="mt-2 text-sm text-clay-text-muted">删除后这条成长数据将从列表和趋势图中移除。</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border-2 border-red-200/40 bg-red-50 px-4 py-3 text-sm font-bold text-red-500 shadow-clay-sm active:translate-y-0.5"
                  onClick={() => handleDelete(deleteId)}
                  style={{ touchAction: 'manipulation' }}
                >
                  删除
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl border-2 border-white/50 bg-white/50 px-4 py-3 text-sm font-bold text-clay-text-muted shadow-clay-sm active:translate-y-0.5"
                  onClick={() => setDeleteId(null)}
                  style={{ touchAction: 'manipulation' }}
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
