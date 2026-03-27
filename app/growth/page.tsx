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
  'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/35 focus:bg-sky-300/[0.06]'

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
        <div className="mission-grid" />
        <div className="scene-noise" />
        <motion.div className="mission-panel p-8 text-center" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <p className="font-display text-xl tracking-[0.12em] text-white">GROWTH FEED LOADING</p>
          <p className="mt-2 text-sm text-slate-400">正在接入成长数据库...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="scene-bg min-h-[100dvh] overflow-hidden pb-10">
      <div className="mission-grid" />
      <div className="scene-noise" />
      <div className="mission-orb right-[-120px] top-[80px] h-[260px] w-[260px] bg-fuchsia-500/14" />

      <div className="relative z-10 px-4 pt-4 md:px-6">
        <header className="mx-auto max-w-6xl">
          <div className="mission-panel px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-sky-300/30 hover:bg-sky-300/10"
                  aria-label="返回首页"
                >
                  <span className="sr-only">返回首页</span>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </a>
                <div>
                  <div className="mission-tag mb-2">growth analytics</div>
                  <h1 className="font-display text-3xl font-bold tracking-[0.08em] text-white">成长记录</h1>
                  <p className="mt-1 text-sm text-slate-400">记录身高与体重变化，把成长数据收拢进同一座分析控制台。</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[380px]">
                {[
                  { value: latest ? `${latest.height}cm` : '--', label: '最新身高', accent: 'text-sky-200' },
                  { value: latest ? `${latest.weight}kg` : '--', label: '最新体重', accent: 'text-rose-200' },
                  { value: age || '--', label: '年龄', accent: 'text-amber-200' },
                ].map(card => (
                  <div key={card.label} className="mission-card-outline p-4 text-center">
                    <p className={`font-display text-2xl font-bold ${card.accent}`}>{card.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-6 grid max-w-6xl gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <section className="flex flex-col gap-6">
            <div className="mission-panel p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <div className="mission-tag mb-3">record input</div>
                  <h2 className="font-display text-2xl font-bold text-white">登记新记录</h2>
                </div>
                <span className="text-sm text-slate-500">{userName ? `${userName} 的成长档案` : '成长档案'}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">记录日期</span>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">出生日期 {age ? `· ${age}` : ''}</span>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">身高 cm</span>
                  <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="120.5" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">体重 kg</span>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="22.3" className={inputClassName} />
                </label>
              </div>

              <motion.button
                type="button"
                className={`mt-5 w-full rounded-2xl px-4 py-4 text-base font-bold transition ${
                  height && weight && date
                    ? 'border border-sky-300/30 bg-[linear-gradient(90deg,rgba(72,229,194,0.18),rgba(102,191,255,0.22),rgba(180,144,255,0.16))] text-white'
                    : 'cursor-not-allowed border border-white/8 bg-white/[0.03] text-slate-500'
                }`}
                onClick={handleSubmit}
                disabled={!height || !weight || !date || submitting}
                whileTap={height && weight && date ? { scale: 0.98 } : undefined}
              >
                {submitting ? '保存中...' : '保存记录'}
              </motion.button>
            </div>

            <div className="mission-panel p-5 md:p-6">
              <div className="mission-tag mb-3">history feed</div>
              {records.length > 0 ? (
                <div className="space-y-2">
                  {[...records].reverse().map(record => (
                    <div key={record._id} className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-xs font-bold text-slate-300">
                        {new Date(`${record.date}T00:00:00`).getDate()}日
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs text-slate-500">{record.date.replace(/-/g, '.')}</p>
                        <div className="mt-1 flex gap-4">
                          <span className="text-sm font-bold text-sky-200">身高 {record.height}cm</span>
                          <span className="text-sm font-bold text-rose-200">体重 {record.weight}kg</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300/10 bg-red-400/8 text-red-200 transition hover:bg-red-400/16"
                        onClick={() => setDeleteId(record._id)}
                        aria-label={`删除 ${record.date} 的成长记录`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center">
                  <p className="font-display text-3xl text-slate-400">NO DATA</p>
                  <p className="mt-2 text-sm text-slate-500">还没有成长记录，先在上方登记第一条。</p>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="mission-panel p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <div className="mission-tag mb-3">trend radar</div>
                  <h2 className="font-display text-2xl font-bold text-white">成长趋势图</h2>
                </div>
                <span className="text-sm text-slate-500">至少两条记录后显示轨迹</span>
              </div>

              {records.length >= 2 ? (
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="mb-3 text-sm font-bold text-sky-200">身高变化</p>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: '1px solid rgba(148,163,184,0.12)',
                              background: 'rgba(8,15,27,0.96)',
                              color: '#e2e8f0',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                              fontSize: 13,
                            }}
                            formatter={value => [`${value} cm`, '身高']}
                            labelFormatter={label => `日期 ${label}`}
                          />
                          <Line type="monotone" dataKey="身高" stroke="#66bfff" strokeWidth={3} dot={{ fill: '#66bfff', r: 4 }} activeDot={{ r: 6, stroke: '#66bfff', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="mb-3 text-sm font-bold text-rose-200">体重变化</p>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: '1px solid rgba(148,163,184,0.12)',
                              background: 'rgba(8,15,27,0.96)',
                              color: '#e2e8f0',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                              fontSize: 13,
                            }}
                            formatter={value => [`${value} kg`, '体重']}
                            labelFormatter={label => `日期 ${label}`}
                          />
                          <Line type="monotone" dataKey="体重" stroke="#ff8fb1" strokeWidth={3} dot={{ fill: '#ff8fb1', r: 4 }} activeDot={{ r: 6, stroke: '#ff8fb1', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-16 text-center">
                  <p className="font-display text-3xl text-slate-400">STANDBY</p>
                  <p className="mt-2 text-sm text-slate-500">至少保存两条记录后，趋势图会自动生成。</p>
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
              className="absolute inset-0 bg-[#02060d]/78 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              className="mission-panel relative z-10 w-full max-w-xs p-6 text-center"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="growth-delete-title"
            >
              <p id="growth-delete-title" className="font-display text-2xl font-bold text-white">删除这条记录？</p>
              <p className="mt-2 text-sm text-slate-400">删除后这条成长数据将从列表和趋势图中移除。</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100"
                  onClick={() => handleDelete(deleteId)}
                  style={{ touchAction: 'manipulation' }}
                >
                  删除
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200"
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
