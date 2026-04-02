'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DAILY_GOAL, PET_MOODS, PET_TYPES, TASKS } from '@/lib/constants'
import type { PetMood } from '@/lib/constants'
import ConfirmDialog from '@/components/ConfirmDialog'
import FoodTray from '@/components/FoodTray'
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

function getCurrentTimeLabel() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function getCompletedTaskCount(tasks: Record<string, TaskStatus>) {
  return TASKS.filter(task => tasks[task.key]?.done).length
}

function applyOptimisticTaskCompletion(
  record: DailyRecordData | null,
  user: UserData | null,
  taskKey: string,
) {
  if (!record || !user || record.tasks[taskKey]?.done) {
    return { nextRecord: record, nextUser: user, allDone: Boolean(record?.allCompleted) }
  }

  const nextTasks = {
    ...record.tasks,
    [taskKey]: {
      done: true,
      completedAt: getCurrentTimeLabel(),
    },
  }

  const allDone = getCompletedTaskCount(nextTasks) >= DAILY_GOAL
  const nextRecord: DailyRecordData = {
    ...record,
    tasks: nextTasks,
    allCompleted: record.allCompleted || allDone,
  }

  if (!allDone || record.allCompleted) {
    return { nextRecord, nextUser: user, allDone }
  }

  const nextStreak = user.stats.streak + 1
  const nextUser: UserData = {
    ...user,
    stats: {
      ...user.stats,
      totalDays: user.stats.totalDays + 1,
      streak: nextStreak,
      maxStreak: Math.max(user.stats.maxStreak, nextStreak),
    },
  }

  return { nextRecord, nextUser, allDone }
}

function applyOptimisticStarCollection(user: UserData | null) {
  if (!user) return user

  return {
    ...user,
    stats: {
      ...user.stats,
      totalStars: user.stats.totalStars + 1,
    },
  }
}

function applyOptimisticFeed(
  record: DailyRecordData | null,
  user: UserData | null,
  taskKey: string,
) {
  if (!record || !user || record.fedTasks.includes(taskKey) || !record.tasks[taskKey]?.done) {
    return { nextRecord: record, nextUser: user }
  }

  const nextFedTasks = [...record.fedTasks, taskKey]
  const nextRecord: DailyRecordData = {
    ...record,
    fedTasks: nextFedTasks,
    fedCount: nextFedTasks.length,
  }

  let nextUser: UserData = user

  if (user.pet.mood === 'runaway') {
    const shouldAdvanceRecall = record.allCompleted && nextRecord.fedCount === 1
    const nextRecallProgress = shouldAdvanceRecall ? (user.pet.recallProgress || 0) + 1 : (user.pet.recallProgress || 0)

    if (nextRecallProgress >= 3) {
      nextUser = {
        ...user,
        pet: {
          ...user.pet,
          mood: 'happy',
          hungryDays: 0,
          recallProgress: 0,
        },
      }
    } else if (shouldAdvanceRecall) {
      nextUser = {
        ...user,
        pet: {
          ...user.pet,
          recallProgress: nextRecallProgress,
        },
      }
    }
  } else {
    nextUser = {
      ...user,
      pet: {
        ...user.pet,
        mood: 'happy',
        hungryDays: 0,
      },
    }
  }

  return { nextRecord, nextUser }
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
  const [optimisticCollectedDates, setOptimisticCollectedDates] = useState<string[]>([])

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
    setConfirmTask(null)
    const previousRecord = record
    const previousUser = user
    const { nextRecord, nextUser, allDone } = applyOptimisticTaskCompletion(record, user, taskKey)

    if (nextRecord) setRecord(nextRecord)
    if (nextUser) setUser(nextUser)
    if (allDone) setShowCelebration(true)

    try {
      const res = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskKey }),
      })
      const data = await res.json()
      if (data.record) setRecord(data.record)
      if (data.user) setUser(data.user)
      if (data.allDone) setShowCelebration(true)
    } catch (error) {
      console.error('任务完成失败', error)
      setRecord(previousRecord)
      setUser(previousUser)
    }
  }

  const handleFeed = async (taskKey: string, foodEmoji: string) => {
    setFeedingFood(foodEmoji)
    setFeedingAnim(true)
    const previousRecord = record
    const previousUser = user
    const { nextRecord, nextUser } = applyOptimisticFeed(record, user, taskKey)
    if (nextRecord) setRecord(nextRecord)
    if (nextUser) setUser(nextUser)

    try {
      const res = await fetch('/api/pet/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskKey }),
      })
      const data = await res.json()
      if (data.user) setUser(data.user)
      if (data.record) setRecord(data.record)
    } catch (error) {
      console.error('投喂失败', error)
      setRecord(previousRecord)
      setUser(previousUser)
    }
    setTimeout(() => setFeedingAnim(false), 2000)
  }

  const handleCollectStar = useCallback(async (sourceRect: DOMRect, date: string) => {
    const target = document.getElementById('star-counter')
    if (!target || optimisticCollectedDates.includes(date)) return

    const targetRect = target.getBoundingClientRect()
    playCollectSound()
    setFlyingHeart({
      sx: sourceRect.left + sourceRect.width / 2,
      sy: sourceRect.top + sourceRect.height / 2,
      tx: targetRect.left + targetRect.width / 2,
      ty: targetRect.top + targetRect.height / 2,
    })
    const previousUser = user

    setOptimisticCollectedDates(prev => [...prev, date])
    setUser(prev => applyOptimisticStarCollection(prev))
    setStarBounce(true)
    setTimeout(() => setStarBounce(false), 600)
    setTimeout(() => setFlyingHeart(null), 650)

    try {
      const res = await fetch('/api/daily/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      const data = await res.json()
      if (data.user) setUser(data.user)
      setWeekRefresh(prev => prev + 1)
    } catch (error) {
      console.error('收集星星失败', error)
      setUser(previousUser)
      setOptimisticCollectedDates(prev => prev.filter(item => item !== date))
      setFlyingHeart(null)
    }
  }, [optimisticCollectedDates, user])

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-duo-bg">
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-duo-green text-white">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <p className="font-display text-lg font-bold text-duo-text">加载中...</p>
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
  const optimisticFullDates = record?.allCompleted ? [record.date] : []

  return (
    <main className="min-h-[100dvh] bg-duo-bg">
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

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* 主要内容区 - 宠物 + 任务 */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* 左侧：宠物区域 */}
          <section className="clay-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-duo-text">宠物小窝</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                goalReached 
                  ? 'bg-duo-green-light text-duo-green' 
                  : 'bg-duo-orange/10 text-duo-orange'
              }`}>
                {goalReached ? '已达标' : '进行中'}
              </span>
            </div>

            {/* 宠物展示区 */}
            <div className="relative rounded-xl bg-gradient-to-b from-duo-green-light/30 to-duo-bg p-4">
              <AnimatePresence>
                {feedingAnim && (
                  <motion.span
                    className="absolute left-1/2 top-8 z-20 -translate-x-1/2 text-3xl"
                    initial={{ y: 100, opacity: 1, scale: 1 }}
                    animate={{ y: 10, opacity: 0, scale: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {feedingFood || '&#127828;'}
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
            </div>

            {/* 投喂面板 */}
            <div className="mt-4 rounded-xl border-2 border-duo-border bg-duo-surface p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-bold text-duo-text">投喂面板</span>
                <span className="text-duo-text-secondary">完成任务解锁</span>
              </div>
              <FoodTray
                tasksDone={Object.fromEntries(TASKS.map(task => [task.key, record?.tasks[task.key]?.done || false]))}
                fedTasks={record?.fedTasks || []}
                onFeed={handleFeed}
                petMood={user.pet.mood}
              />
            </div>

            {/* 统计数据 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-3 text-center">
                <p className="text-xs text-duo-text-secondary">总天数</p>
                <p className="mt-1 font-display text-xl font-bold text-duo-text">{user.stats.totalDays}</p>
              </div>
              <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-3 text-center">
                <p className="text-xs text-duo-text-secondary">最高连续</p>
                <p className="mt-1 font-display text-xl font-bold text-duo-text">{user.stats.maxStreak}</p>
              </div>
              <div className="rounded-xl border-2 border-duo-border bg-duo-surface p-3 text-center">
                <p className="text-xs text-duo-text-secondary">待投喂</p>
                <p className="mt-1 font-display text-xl font-bold text-duo-orange">{Math.max(canFeedCount, 0)}</p>
              </div>
            </div>
          </section>

          {/* 右侧：任务区域 */}
          <section className="space-y-6">
            {/* 任务卡片区域 */}
            <div className="clay-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-green-light text-xl">
                    &#128218;
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-duo-text">今日任务</h2>
                    <p className="text-sm text-duo-text-secondary">完成任务喂养宠物</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-duo-green-light px-3 py-1 text-xs font-bold text-duo-green">
                    {completedCount} 已完成
                  </span>
                  <span className="rounded-full bg-duo-bg px-3 py-1 text-xs font-bold text-duo-text-secondary">
                    {TASKS.length - completedCount} 待完成
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {TASKS.map((task, index) => (
                  <motion.div
                    key={task.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, ease: 'easeOut' }}
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

            {/* 本周记录 */}
            <WeekCalendar
              refreshKey={completedCount + weekRefresh}
              onCollectStar={handleCollectStar}
              optimisticCollectedDates={optimisticCollectedDates}
              optimisticFullDates={optimisticFullDates}
            />

            {/* 提示卡片 */}
            <div className="clay-card p-5">
              <h3 className="mb-4 font-display text-lg font-bold text-duo-text">使用指南</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border-2 border-duo-border bg-duo-green-light/30 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-duo-green text-white text-sm font-bold">1</div>
                  <p className="text-sm font-bold text-duo-text">完成任务</p>
                  <p className="mt-1 text-xs text-duo-text-secondary">每日完成 {DAILY_GOAL} 个任务达标</p>
                </div>
                <div className="rounded-xl border-2 border-duo-border bg-duo-orange/5 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-duo-orange text-white text-sm font-bold">2</div>
                  <p className="text-sm font-bold text-duo-text">投喂宠物</p>
                  <p className="mt-1 text-xs text-duo-text-secondary">每完成一项可投喂一次</p>
                </div>
                <div className="rounded-xl border-2 border-duo-border bg-duo-yellow/10 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-duo-yellow text-white text-sm font-bold">3</div>
                  <p className="text-sm font-bold text-duo-text">收集星星</p>
                  <p className="mt-1 text-xs text-duo-text-secondary">达标后可领取星星奖励</p>
                </div>
              </div>
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
              className="block text-2xl text-duo-yellow"
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
