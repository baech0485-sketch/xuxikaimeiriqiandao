'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
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
  if (months < 0) { years--; months += 12 }
  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) { years--; months += 12 }
  }
  return `${years}岁${months}个月`
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
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

  const chartData = useMemo(() =>
    records.map(r => ({
      date: formatDate(r.date),
      fullDate: r.date,
      身高: r.height,
      体重: r.weight,
    })),
  [records])

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
      <main className="scene-bg flex items-center justify-center">
        <motion.div className="text-center" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <p className="text-base text-gray-500 font-bold">加载中...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="scene-bg pb-8">
      <div className="cloud top-16 animate-slide-cloud" style={{ opacity: 0.15 }}>☁️</div>

      {/* 顶部 */}
      <header className="sticky top-0 z-30 px-4 py-2">
        <div className="max-w-2xl mx-auto bg-white/85 backdrop-blur-xl rounded-2xl shadow-kid px-5 py-2.5 flex items-center justify-between">
          <a href="/" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 transition-colors">
            ←
          </a>
          <h1 className="text-base font-bold text-gray-800">📏 成长记录</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 relative z-10">
        {/* 信息卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { value: latest ? `${latest.height}cm` : '--', label: '身高', emoji: '📐', bg: 'from-candy-blue-light/60 to-candy-blue-light/30' },
            { value: latest ? `${latest.weight}kg` : '--', label: '体重', emoji: '⚖️', bg: 'from-candy-pink-light/60 to-candy-pink-light/30' },
            { value: age || '--', label: '年龄', emoji: '🎂', bg: 'from-candy-yellow-light/60 to-candy-yellow-light/30' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-3 text-center bg-gradient-to-b ${s.bg} shadow-kid`}
            >
              <p className="text-xl font-bold text-gray-600">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.emoji} {s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 录入表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-kid mb-5"
        >
          <h2 className="text-sm font-bold text-gray-600 mb-3">📝 登记记录</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">记录日期</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-candy-blue/20 focus:border-candy-blue focus:outline-none bg-candy-blue-light/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">出生日期{age ? ` (${age})` : ''}</label>
              <input
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-candy-yellow/20 focus:border-candy-yellow focus:outline-none bg-candy-yellow-light/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">身高 (cm)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="120.5"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-candy-blue/20 focus:border-candy-blue focus:outline-none bg-candy-blue-light/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="22.3"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-candy-pink/20 focus:border-candy-pink focus:outline-none bg-candy-pink-light/20 text-sm"
              />
            </div>
          </div>

          <motion.button
            className={`w-full btn-kid text-base shadow-kid ${
              height && weight && date
                ? 'bg-gradient-to-r from-candy-blue/70 to-candy-mint/70 text-white'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
            }`}
            onClick={handleSubmit}
            disabled={!height || !weight || !date || submitting}
            whileTap={height && weight ? { scale: 0.96 } : undefined}
          >
            {submitting ? '保存中...' : '保存记录'}
          </motion.button>
        </motion.div>

        {/* 趋势图 */}
        {records.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-kid mb-5"
          >
            <h2 className="text-sm font-bold text-gray-600 mb-4">📊 成长趋势</h2>

            {/* 身高图 */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-2">📐 身高变化 (cm)</p>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E2" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#999' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                      formatter={(v) => [`${v} cm`, '身高']}
                    />
                    <Line
                      type="monotone"
                      dataKey="身高"
                      stroke="#8CBFD6"
                      strokeWidth={3}
                      dot={{ fill: '#8CBFD6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, stroke: '#8CBFD6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 体重图 */}
            <div>
              <p className="text-xs text-gray-400 mb-2">⚖️ 体重变化 (kg)</p>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5DFE5" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11, fill: '#999' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                      formatter={(v) => [`${v} kg`, '体重']}
                    />
                    <Line
                      type="monotone"
                      dataKey="体重"
                      stroke="#E8A0B4"
                      strokeWidth={3}
                      dot={{ fill: '#E8A0B4', r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, stroke: '#E8A0B4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* 历史记录 */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-kid"
          >
            <h2 className="text-sm font-bold text-gray-600 mb-3">📋 历史记录</h2>
            <div className="space-y-2">
              {[...records].reverse().map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-candy-mint-light/50 flex items-center justify-center text-sm font-bold text-gray-500">
                    {new Date(r.date + 'T00:00:00').getDate()}日
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400">{r.date.replace(/-/g, '.')}</p>
                    <div className="flex gap-4 mt-0.5">
                      <span className="text-sm font-bold text-candy-blue">📐 {r.height}cm</span>
                      <span className="text-sm font-bold text-candy-pink">⚖️ {r.weight}kg</span>
                    </div>
                  </div>
                  <button
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-400 transition-colors text-sm"
                    onClick={() => setDeleteId(r._id)}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {records.length === 0 && (
          <div className="text-center py-12 text-gray-300">
            <p className="text-4xl mb-3">📏</p>
            <p className="text-sm font-bold">还没有记录</p>
            <p className="text-xs mt-1">填写上方表单开始记录成长吧~</p>
          </div>
        )}
      </div>

      {/* 删除确认 */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div
              className="relative z-10 bg-white rounded-3xl p-6 shadow-kid-lg max-w-xs w-full text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <p className="text-lg font-bold text-gray-600 mb-4">确定删除这条记录？</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 btn-kid bg-red-100 text-red-500 text-base"
                  onClick={() => handleDelete(deleteId)}
                  style={{ touchAction: 'manipulation' }}
                >
                  删除
                </button>
                <button
                  className="flex-1 btn-kid bg-gray-100 text-gray-400 text-base"
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
