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
        {/* 装饰泡泡 */}
        <div className="clay-bubble left-[10%] top-[15%] h-[120px] w-[120px] bg-clay-primary/10" />
        <div className="clay-bubble right-[15%] top-[25%] h-[80px] w-[80px] bg-clay-pink/12" />
        <div className="clay-bubble left-[20%] bottom-[20%] h-[60px] w-[60px] bg-clay-gold/15" />

        <motion.div
          className="clay-card w-[min(92vw,420px)] p-8 text-center"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] border-3 border-white/60 bg-gradient-to-br from-clay-primary/15 to-clay-pink/15 shadow-clay-sm">
            <span className="font-display text-3xl">🐾</span>
          </div>
          <p className="font-display text-xl tracking-wide text-clay-text">加载中...</p>
          <p className="mt-2 text-sm text-clay-text-muted">正在准备今日任务和宠物数据...</p>
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
  const completionLabel = goalReached ? '今日目标完成，继续加油！' : `再完成 ${remainingCount} 个任务即可达标`

  return (
    <main className="scene-bg min-h-[100dvh] overflow-hidden">
      {/* 装饰泡泡 */}
      <div className="clay-bubble left-[-60px] top-[80px] h-[180px] w-[180px] bg-clay-primary/8" />
      <div className="clay-bubble right-[-50px] top-[200px] h-[140px] w-[140px] bg-clay-pink/10" />
      <div className="clay-bubble left-[30%] bottom-[100px] h-[100px] w-[100px] bg-clay-gold/10" />
      <div className="clay-bubble right-[25%] bottom-[200px] h-[70px] w-[70px] bg-clay-mint/12" />

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
            {/* 左侧：任务仪表盘 */}
            <div className="clay-card p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div>
                  <div className="clay-tag mb-4">Today Dashboard</div>
                  <h2 className="font-display text-3xl font-bold leading-tight text-clay-text md:text-4xl">
                    完成任务，
                    <br className="hidden md:block" />
                    喂养你的小伙伴！
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-clay-text-muted md:text-base">
                    每完成一个学习任务，就能获得一份食物来喂养你的宠物。坚持每天完成目标，收集更多星星吧！
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="clay-stat">
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">总运行天数</p>
                      <p className="mt-3 font-display text-3xl font-bold text-clay-text">{user.stats.totalDays}</p>
                    </div>
                    <div className="clay-stat">
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">最高连续</p>
                      <p className="mt-3 font-display text-3xl font-bold text-clay-text">{user.stats.maxStreak}</p>
                    </div>
                    <div className="clay-stat">
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">待投喂</p>
                      <p className="mt-3 font-display text-3xl font-bold text-clay-amber">{Math.max(canFeedCount, 0)}</p>
                    </div>
                  </div>
                </div>

                {/* 今日状态卡片 */}
                <div className="clay-card-accent p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">Today</p>
                      <p className="mt-2 text-lg font-bold text-clay-text">任务推进总览</p>
                    </div>
                    <span className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${goalReached ? 'border-clay-mint/30 bg-clay-mint-light text-clay-mint' : 'border-clay-primary/20 bg-clay-primary-light text-clay-primary'}`}>
                      {goalReached ? '已达标' : '推进中'}
                    </span>
                  </div>

                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="font-display text-5xl font-bold text-clay-text">{completedCount}</p>
                      <p className="mt-1 text-sm text-clay-text-muted">已完成 / 目标 {DAILY_GOAL}</p>
                    </div>
                    <p className="text-sm text-clay-text-muted">{completionLabel}</p>
                  </div>

                  <div className="clay-progress-track">
                    <motion.div
                      className="clay-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border-2 border-white/50 bg-white/40 p-4 shadow-clay-sm">
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">下一步</p>
                      <p className="mt-2 text-base font-bold text-clay-text">{nextTask ? nextTask.name : '全部完成！'}</p>
                    </div>
                    <div className="rounded-[20px] border-2 border-white/50 bg-white/40 p-4 shadow-clay-sm">
                      <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">宠物心情</p>
                      <p className="mt-2 text-base font-bold text-clay-text">{petMoodInfo.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：宠物区 */}
            <section className="clay-card p-6 md:p-7">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="clay-tag mb-3">Pet Zone</div>
                  <h3 className="font-display text-2xl font-bold text-clay-text">宠物小窝</h3>
                  <p className="mt-2 text-sm text-clay-text-muted">当前搭档：{petInfo.name} · {petInfo.personality}</p>
                </div>
                <div className="rounded-full border-2 border-white/50 bg-white/40 px-3 py-1 text-xs font-bold text-clay-text-muted shadow-clay-sm">
                  {user.pet.mood === 'runaway' ? '召回模式' : '在线互动中'}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border-2 border-white/50 bg-gradient-to-b from-clay-primary/5 via-clay-pink/5 to-clay-gold/5 px-5 py-6 shadow-inner-soft">
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

                <div className="mt-5 rounded-[24px] border-2 border-white/40 bg-white/30 p-4 shadow-clay-sm">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="font-bold text-clay-text-muted">投喂面板</span>
                    <span className="text-clay-text-light">完成任务后解锁</span>
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
            {/* 任务矩阵 */}
            <div className="clay-card p-6 md:p-7">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="clay-tag mb-3">Tasks</div>
                  <h3 className="font-display text-2xl font-bold text-clay-text">今日任务</h3>
                  <p className="mt-2 text-sm text-clay-text-muted">完成任务获得食物，喂养你的小伙伴吧！</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border-2 border-clay-mint/20 bg-clay-mint-light px-3 py-1 text-xs font-bold text-clay-mint">{completedCount} 已完成</span>
                  <span className="rounded-full border-2 border-clay-primary/15 bg-clay-primary-light px-3 py-1 text-xs font-bold text-clay-primary">{TASKS.length - completedCount} 待完成</span>
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
              className="block text-2xl text-clay-gold"
              style={{ marginLeft: -14, marginTop: -14 }}
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.65 }}
            >
              &#11088;
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
