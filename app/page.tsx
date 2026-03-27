'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DAILY_GOAL, PET_MOODS, PET_TYPES, TASKS } from '@/lib/constants'
import type { PetMood } from '@/lib/constants'
import ConfirmDialog from '@/components/ConfirmDialog'
import FoodTray from '@/components/FoodTray'
import ControlNotes from '@/components/home/ControlNotes'
import PetDisplay from '@/components/Pet/PetDisplay'
import StarBurst from '@/components/StarBurst'
import TaskCard from '@/components/TaskCard'
import TopNav from '@/components/TopNav'
import WeekCalendar from '@/components/WeekCalendar'
import { playCollectSound } from '@/lib/sounds'

interface UserData {
  _id: string
  name: string
  pet: { type: string; name: string; mood: PetMood; hungryDays: number; recallProgress: number }
  stats: { totalStars: number; streak: number; maxStreak: number; totalDays: number }
}

interface TaskStatus {
  done: boolean
  completedAt: string | null
}

interface DailyRecordData {
  _id: string
  date: string
  tasks: Record<string, TaskStatus>
  fedCount: number
  fedTasks: string[]
  allCompleted: boolean
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [record, setRecord] = useState<DailyRecordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confirmTask, setConfirmTask] = useState<typeof TASKS[number] | null>(null)
  const [feedingAnim, setFeedingAnim] = useState(false)
  const [feedingFood, setFeedingFood] = useState('')
  const [flyingHeart, setFlyingHeart] = useState<{ sx: number; sy: number; tx: number; ty: number } | null>(null)
  const [starBounce, setStarBounce] = useState(false)
  const [weekRefresh, setWeekRefresh] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const userRes = await fetch('/api/user')
      const { user: userData } = await userRes.json()
      if (!userData) {
        router.push('/adopt')
        return
      }

      const statusRes = await fetch('/api/pet/status', { method: 'POST' })
      const { user: updatedUser } = await statusRes.json()
      const dailyRes = await fetch('/api/daily')
      const { record: dailyRecord } = await dailyRes.json()
      setUser(updatedUser || userData)
      setRecord(dailyRecord)
    } catch (error) {
      console.error('加载失败', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCompleteTask = async (taskKey: string) => {
    const res = await fetch('/api/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskKey }),
    })
    const data = await res.json()
    if (data.record) setRecord(data.record)
    if (data.user) setUser(data.user)
    if (data.allDone) setTimeout(() => setShowCelebration(true), 500)
    setConfirmTask(null)
  }

  const handleFeed = async (taskKey: string, foodEmoji: string) => {
    setFeedingFood(foodEmoji)
    setFeedingAnim(true)
    const res = await fetch('/api/pet/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskKey }),
    })
    const data = await res.json()
    if (data.user) setUser(data.user)
    if (data.record) setRecord(data.record)
    setTimeout(() => setFeedingAnim(false), 2000)
  }

  const handleCollectStar = useCallback(async (sourceRect: DOMRect, date: string) => {
    const target = document.getElementById('star-counter')
    if (!target) return

    const targetRect = target.getBoundingClientRect()
    playCollectSound()
    setFlyingHeart({
      sx: sourceRect.left + sourceRect.width / 2,
      sy: sourceRect.top + sourceRect.height / 2,
      tx: targetRect.left + targetRect.width / 2,
      ty: targetRect.top + targetRect.height / 2,
    })

    const res = await fetch('/api/daily/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    const data = await res.json()
    if (data.user) setUser(data.user)

    setTimeout(() => {
      setStarBounce(true)
      setFlyingHeart(null)
      setWeekRefresh(prev => prev + 1)
      setTimeout(() => setStarBounce(false), 600)
    }, 650)
  }, [])

  if (loading) {
    return (
      <main className="scene-bg flex min-h-[100dvh] items-center justify-center">
        <div className="mission-grid" />
        <div className="scene-noise" />
        <motion.div
          className="mission-panel w-[min(92vw,420px)] p-8 text-center"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] border border-sky-300/20 bg-[radial-gradient(circle_at_top,#67d8ff55,#0d1727_70%)]">
            <span className="font-display text-3xl text-sky-100">✦</span>
          </div>
          <p className="font-display text-xl tracking-[0.12em] text-white">MISSION LOADING</p>
          <p className="mt-2 text-sm text-slate-400">正在接入宠物观测站与今日任务数据...</p>
        </motion.div>
      </main>
    )
  }

  if (!user) return null

  const petInfo = PET_TYPES.find(p => p.type === user.pet.type) || PET_TYPES[0]
  const petMoodInfo = PET_MOODS[user.pet.mood]
  const completedCount = record ? TASKS.filter(task => record.tasks[task.key]?.done).length : 0
  const canFeedCount = record ? completedCount - record.fedCount : 0
  const goalReached = completedCount >= DAILY_GOAL
  const progress = Math.min((completedCount / DAILY_GOAL) * 100, 100)
  const remainingCount = Math.max(DAILY_GOAL - completedCount, 0)
  const nextTask = TASKS.find(task => !record?.tasks[task.key]?.done)
  const completionLabel = goalReached ? '今日目标完成，正在积累额外星能。' : `再完成 ${remainingCount} 个任务即可达标。`

  return (
    <main className="scene-bg min-h-[100dvh] overflow-hidden">
      <div className="mission-grid" />
      <div className="scene-noise" />
      <div className="mission-orb left-[-120px] top-[80px] h-[280px] w-[280px] bg-sky-400/18" />
      <div className="mission-orb bottom-[140px] right-[-100px] h-[260px] w-[260px] bg-fuchsia-500/14" />

      <div className="relative z-10 pb-10">
        <TopNav
          totalStars={user.stats.totalStars}
          streak={user.stats.streak}
          childName={user.name}
          starBounce={starBounce}
          completedCount={completedCount}
          dailyGoal={DAILY_GOAL}
          canFeedCount={canFeedCount}
          moodLabel={petMoodInfo.label}
        />

        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-6 px-4 md:px-6">
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="mission-panel p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div>
                  <div className="mission-tag mb-4">night mission / dashboard</div>
                  <h2 className="font-display text-4xl font-bold leading-tight tracking-[0.06em] text-white md:text-5xl">
                    让每一次任务完成，
                    <br className="hidden md:block" />
                    都变成宠物能量回流。
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/82 md:text-base">
                    我把主页改造成了一座夜间任务观测站：左侧负责指挥今日节奏，右侧显示宠物舱状态。完成任务、投喂补给、收集星标，整套流程都留在同一块仪表盘里。
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="mission-stat">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">总运行天数</p>
                      <p className="mt-3 font-display text-3xl text-white">{user.stats.totalDays}</p>
                    </div>
                    <div className="mission-stat">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">最高连续记录</p>
                      <p className="mt-3 font-display text-3xl text-white">{user.stats.maxStreak}</p>
                    </div>
                    <div className="mission-stat">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">待投喂补给</p>
                      <p className="mt-3 font-display text-3xl text-white">{Math.max(canFeedCount, 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="mission-card-outline p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">today status</p>
                      <p className="mt-2 text-lg font-bold text-white">任务推进总览</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${goalReached ? 'bg-emerald-400/12 text-emerald-200' : 'bg-sky-400/12 text-sky-200'}`}>
                      {goalReached ? '已达标' : '推进中'}
                    </span>
                  </div>

                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="font-display text-5xl text-white">{completedCount}</p>
                      <p className="mt-1 text-sm text-slate-400">已完成 / 目标 {DAILY_GOAL}</p>
                    </div>
                    <p className="text-sm text-slate-300">{completionLabel}</p>
                  </div>

                  <div className="mission-progress-track">
                    <motion.div
                      className="mission-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">下一步</p>
                      <p className="mt-2 text-base font-bold text-white">{nextTask ? nextTask.name : '全部完成，领取星标'}</p>
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">宠物心情</p>
                      <p className="mt-2 text-base font-bold text-white">{petMoodInfo.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="mission-panel p-6 md:p-7">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mission-tag mb-3">pet chamber</div>
                  <h3 className="font-display text-2xl font-bold tracking-[0.08em] text-white">宠物观测舱</h3>
                  <p className="mt-2 text-sm text-slate-400">当前搭档：{petInfo.name} · {petInfo.personality}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {user.pet.mood === 'runaway' ? '召回模式' : '在线互动中'}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-sky-300/12 bg-[radial-gradient(circle_at_top,rgba(102,191,255,0.16),transparent_38%),linear-gradient(180deg,rgba(7,16,29,0.95),rgba(5,10,18,0.85))] px-5 py-6">
                <div className="absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-sky-200/20 to-transparent" />

                <AnimatePresence>
                  {feedingAnim && (
                    <motion.span
                      className="absolute left-1/2 top-12 z-20 -translate-x-1/2 text-4xl"
                      initial={{ y: 180, opacity: 1, scale: 1 }}
                      animate={{ y: 18, opacity: 0, scale: 0.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                      {feedingFood || '🍎'}
                    </motion.span>
                  )}
                </AnimatePresence>

                <PetDisplay
                  petType={user.pet.type}
                  petEmoji={petInfo.emoji}
                  petImage={petInfo.image}
                  petImagePng={petInfo.imagePng}
                  petImageEating={petInfo.imageEating}
                  petImageEatingPng={petInfo.imageEatingPng}
                  petImageHungry={petInfo.imageHungry}
                  petImageHungryPng={petInfo.imageHungryPng}
                  petImageSad={petInfo.imageSad}
                  petImageSadPng={petInfo.imageSadPng}
                  mood={user.pet.mood}
                  petName={user.pet.name}
                  hungryDays={user.pet.hungryDays}
                  recallProgress={user.pet.recallProgress}
                  isEating={feedingAnim}
                  riveFile={petInfo.riveFile}
                />

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-slate-300">补给投放面板</span>
                    <span className="text-slate-500">完成任务后解锁</span>
                  </div>
                  <FoodTray
                    tasksDone={Object.fromEntries(TASKS.map(task => [task.key, record?.tasks[task.key]?.done || false]))}
                    fedTasks={record?.fedTasks || []}
                    onFeed={handleFeed}
                    petMood={user.pet.mood}
                  />
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="mission-panel p-6 md:p-7">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mission-tag mb-3">task matrix</div>
                  <h3 className="font-display text-2xl font-bold tracking-[0.08em] text-white">今日任务矩阵</h3>
                  <p className="mt-2 text-sm text-slate-400">每张卡片现在都是独立任务模块，完成后会立刻转为已归档状态。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{completedCount} 已完成</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{TASKS.length - completedCount} 待处理</span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {TASKS.map((task, index) => (
                  <motion.div
                    key={task.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: 'easeOut' }}
                  >
                    <TaskCard
                      task={task}
                      done={record?.tasks[task.key]?.done || false}
                      completedAt={record?.tasks[task.key]?.completedAt || null}
                      onComplete={() => setConfirmTask(task)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <WeekCalendar refreshKey={completedCount + weekRefresh} onCollectStar={handleCollectStar} />
              <ControlNotes dailyGoal={DAILY_GOAL} />
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        show={Boolean(confirmTask)}
        taskEmoji={confirmTask?.emoji || ''}
        taskName={confirmTask?.name || ''}
        onConfirm={() => confirmTask && handleCompleteTask(confirmTask.key)}
        onCancel={() => setConfirmTask(null)}
      />
      <StarBurst show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <AnimatePresence>
        {flyingHeart && (
          <motion.div
            className="pointer-events-none fixed z-50"
            style={{ left: flyingHeart.sx, top: flyingHeart.sy }}
            initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
            animate={{
              x: flyingHeart.tx - flyingHeart.sx,
              y: flyingHeart.ty - flyingHeart.sy,
              scale: [1, 1.5, 0.6],
              opacity: [1, 1, 0.8],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.span
              className="block text-2xl text-amber-200"
              style={{ marginLeft: -14, marginTop: -14 }}
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.65 }}
            >
              ✦
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
