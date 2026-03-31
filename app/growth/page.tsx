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
        height: record.height,
        weight: record.weight,
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
      <main className="flex min-h-[100dvh] items-center justify-center bg-duo-bg">
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-duo-blue text-white">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <p className="font-display text-lg font-bold text-duo-text">加载中...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-duo-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b-2 border-duo-border bg-duo-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-duo-border text-duo-text-secondary transition hover:bg-duo-bg"
              aria-label="返回首页"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <div>
              <h1 className="font-display text-xl font-bold text-duo-text">成长记录</h1>
              {userName && <p className="text-sm text-duo-text-secondary">{userName} 的成长档案</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {latest && (
              <>
                <div className="rounded-full bg-duo-blue/10 px-3 py-1.5">
                  <span className="text-sm font-bold text-duo-blue">{latest.height}cm</span>
                </div>
                <div className="rounded-full bg-duo-purple/10 px-3 py-1.5">
                  <span className="text-sm font-bold text-duo-purple">{latest.weight}kg</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* 左侧：图表区域 */}
          <section className="space-y-6">
            {/* 趋势图表 */}
            <div className="clay-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-duo-text">成长趋势</h2>
                <span className="text-sm text-duo-text-secondary">至少2条数据后显示</span>
              </div>

              {records.length >= 2 ? (
                <div className="space-y-6">
                  {/* 身高图表 */}
                  <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-4">
                    <p className="mb-3 text-sm font-bold text-duo-blue">身高变化 (cm)</p>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#777' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#777' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: '2px solid #E5E5E5',
                              background: '#FFFFFF',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                            formatter={value => [`${value} cm`, '身高']}
                          />
                          <Line type="monotone" dataKey="height" stroke="#1CB0F6" strokeWidth={3} dot={{ fill: '#1CB0F6', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 体重图表 */}
                  <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-4">
                    <p className="mb-3 text-sm font-bold text-duo-purple">体重变化 (kg)</p>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#777' }} axisLine={false} tickLine={false} />
                          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11, fill: '#777' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: '2px solid #E5E5E5',
                              background: '#FFFFFF',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                            formatter={value => [`${value} kg`, '体重']}
                          />
                          <Line type="monotone" dataKey="weight" stroke="#CE82FF" strokeWidth={3} dot={{ fill: '#CE82FF', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-duo-border bg-duo-bg py-16 text-center">
                  <p className="font-display text-2xl text-duo-text-light">等待数据</p>
                  <p className="mt-2 text-sm text-duo-text-secondary">保存至少2条记录后显示图表</p>
                </div>
              )}
            </div>

            {/* 历史记录 */}
            <div className="clay-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-duo-text">历史记录</h2>
              {records.length > 0 ? (
                <div className="space-y-2">
                  {[...records].reverse().map(record => (
                    <div
                      key={record._id}
                      className="flex items-center gap-3 rounded-xl border-2 border-duo-border bg-duo-surface p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-duo-bg text-sm font-bold text-duo-text-secondary">
                        {new Date(`${record.date}T00:00:00`).getDate()}
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs text-duo-text-light">{record.date.replace(/-/g, '.')}</p>
                        <div className="mt-1 flex gap-3">
                          <span className="text-sm font-bold text-duo-blue">{record.height}cm</span>
                          <span className="text-sm font-bold text-duo-purple">{record.weight}kg</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-duo-red/30 text-duo-red transition hover:bg-duo-red/10"
                        onClick={() => setDeleteId(record._id)}
                        aria-label="删除记录"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-duo-border bg-duo-bg py-10 text-center">
                  <p className="text-duo-text-secondary">暂无记录</p>
                </div>
              )}
            </div>
          </section>

          {/* 右侧：输入表单 */}
          <aside className="space-y-4">
            <div className="clay-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-duo-text">添加记录</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-duo-text-secondary">记录日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-sm text-duo-text outline-none transition focus:border-duo-green"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-duo-text-secondary">
                    出生日期 {age && <span className="text-duo-orange">({age})</span>}
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-sm text-duo-text outline-none transition focus:border-duo-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-duo-text-secondary">身高 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder="120.5"
                      className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-sm text-duo-text outline-none transition placeholder:text-duo-text-light focus:border-duo-blue"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-duo-text-secondary">体重 (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="22.3"
                      className="w-full rounded-xl border-2 border-duo-border bg-duo-bg px-4 py-3 text-sm text-duo-text outline-none transition placeholder:text-duo-text-light focus:border-duo-purple"
                    />
                  </div>
                </div>

                <motion.button
                  type="button"
                  className={`w-full rounded-xl py-4 text-base font-bold uppercase tracking-wide ${
                    height && weight && date
                      ? 'btn-duo'
                      : 'cursor-not-allowed border-2 border-duo-border bg-duo-bg text-duo-text-light'
                  }`}
                  onClick={handleSubmit}
                  disabled={!height || !weight || !date || submitting}
                  whileTap={height && weight && date ? { scale: 0.98 } : undefined}
                >
                  {submitting ? '保存中...' : '保存记录'}
                </motion.button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="clay-card p-5">
              <h3 className="mb-4 font-display text-lg font-bold text-duo-text">数据概览</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-4 text-center">
                  <p className="text-xs text-duo-text-secondary">记录次数</p>
                  <p className="mt-1 font-display text-2xl font-bold text-duo-text">{records.length}</p>
                </div>
                <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-4 text-center">
                  <p className="text-xs text-duo-text-secondary">年龄</p>
                  <p className="mt-1 font-display text-xl font-bold text-duo-orange">{age || '--'}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 删除确认弹窗 */}
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
              aria-label="取消删除"
              className="absolute inset-0 bg-duo-text/20 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-xs rounded-2xl border-2 border-duo-border bg-duo-surface p-6 text-center"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <p className="font-display text-xl font-bold text-duo-text">删除这条记录？</p>
              <p className="mt-2 text-sm text-duo-text-secondary">删除后无法恢复</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl border-2 border-duo-red/30 bg-duo-red/10 py-3 text-sm font-bold text-duo-red transition hover:bg-duo-red/20"
                  onClick={() => handleDelete(deleteId)}
                >
                  删除
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border-2 border-duo-border bg-duo-bg py-3 text-sm font-bold text-duo-text-secondary transition hover:bg-duo-surface"
                  onClick={() => setDeleteId(null)}
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
