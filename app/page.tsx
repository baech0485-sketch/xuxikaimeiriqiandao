'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PET_TYPES, TASKS, DAILY_GOAL } from '@/lib/constants'
import type { PetMood } from '@/lib/constants'
import PetDisplay from '@/components/Pet/PetDisplay'
import TaskCard from '@/components/TaskCard'
import FeedButton from '@/components/FeedButton'
import TopNav from '@/components/TopNav'
import WeekCalendar from '@/components/WeekCalendar'
import StarBurst from '@/components/StarBurst'
import ConfirmDialog from '@/components/ConfirmDialog'

interface UserData {
  _id: string
  name: string
  pet: { type: string; name: string; mood: PetMood; hungryDays: number; recallProgress: number }
  stats: { totalStars: number; streak: number; maxStreak: number; totalDays: number }
}

interface TaskStatus { done: boolean; completedAt: string | null }

interface DailyRecordData {
  _id: string; date: string; tasks: Record<string, TaskStatus>; fedCount: number; allCompleted: boolean
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [record, setRecord] = useState<DailyRecordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confirmTask, setConfirmTask] = useState<typeof TASKS[number] | null>(null)
  const [feedingAnim, setFeedingAnim] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const userRes = await fetch('/api/user')
      const { user: userData } = await userRes.json()
      if (!userData) { router.push('/adopt'); return }
      const statusRes = await fetch('/api/pet/status', { method: 'POST' })
      const { user: updatedUser } = await statusRes.json()
      const dailyRes = await fetch('/api/daily')
      const { record: dailyRecord } = await dailyRes.json()
      setUser(updatedUser || userData)
      setRecord(dailyRecord)
    } catch (e) { console.error('加载失败', e) } finally { setLoading(false) }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const handleCompleteTask = async (taskKey: string) => {
    const res = await fetch('/api/daily', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskKey }),
    })
    const data = await res.json()
    if (data.record) setRecord(data.record)
    if (data.user) setUser(data.user)
    if (data.allDone) setTimeout(() => setShowCelebration(true), 500)
    setConfirmTask(null)
  }

  const handleFeed = async () => {
    setFeedingAnim(true)
    const res = await fetch('/api/pet/feed', { method: 'POST' })
    const data = await res.json()
    if (data.user) setUser(data.user)
    if (data.fedCount !== undefined && record) setRecord({ ...record, fedCount: data.fedCount })
    setTimeout(() => setFeedingAnim(false), 2000)
  }

  if (loading) {
    return (
      <main className="scene-bg flex items-center justify-center">
        <motion.div className="text-center" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center shadow-kid">
            <span className="text-4xl">🐾</span>
          </div>
          <p className="text-base text-gray-500 font-bold">加载中...</p>
        </motion.div>
      </main>
    )
  }

  if (!user) return null

  const petInfo = PET_TYPES.find(p => p.type === user.pet.type) || PET_TYPES[0]
  const completedCount = record ? TASKS.filter(t => record.tasks[t.key]?.done).length : 0
  const canFeedCount = record ? completedCount - record.fedCount : 0
  const goalReached = completedCount >= DAILY_GOAL
  const progress = (completedCount / DAILY_GOAL) * 100

  return (
    <main className="scene-bg pb-8">
      {/* 装饰云朵 */}
      <div className="cloud top-16 animate-slide-cloud" style={{ animationDelay: '0s', opacity: 0.2 }}>☁️</div>
      <div className="cloud top-28 animate-slide-cloud-2" style={{ animationDelay: '-15s', fontSize: '2rem', opacity: 0.15 }}>☁️</div>

      <div className="relative z-10">
        <TopNav totalStars={user.stats.totalStars} streak={user.stats.streak} childName={user.name} />

        <div className="max-w-5xl mx-auto px-4 pt-3">
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-sm font-bold text-gray-500">今日进度（完成{DAILY_GOAL}个达标）</span>
              <span className="text-sm font-bold text-gray-600">
                {completedCount}/{DAILY_GOAL}
                {goalReached && ' 🎉'}
              </span>
            </div>
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            {/* 左侧：宠物区 */}
            <div className="md:w-[38%] flex flex-col">
              <div className="card-kid w-full h-full relative overflow-hidden flex flex-col">
                {/* 宠物区内部背景 */}
                <div className="absolute inset-0 bg-gradient-to-b from-candy-blue-light/20 to-candy-mint-light/20 rounded-3xl" />
                {/* 草地装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-candy-mint-light/20 to-transparent rounded-b-3xl" />

                <div className="relative z-10 pt-2 pb-4 flex flex-col items-center flex-grow justify-center">
                  {/* 喂食动画 */}
                  <AnimatePresence>
                    {feedingAnim && (
                      <motion.span
                        className="absolute text-4xl z-20 left-1/2 -translate-x-1/2"
                        initial={{ y: 180, opacity: 1, scale: 1 }}
                        animate={{ y: 20, opacity: 0, scale: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      >
                        {petInfo.foodEmoji}
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

                  <div className="flex justify-center mt-2">
                    <FeedButton
                      foodEmoji={petInfo.foodEmoji}
                      canFeed={canFeedCount > 0}
                      feedCount={canFeedCount}
                      onFeed={handleFeed}
                      petMood={user.pet.mood}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：任务列表 */}
            <div className="md:w-[62%]">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-gray-500 drop-shadow-sm">
                  📋 今日任务
                </h2>
                {goalReached && (
                  <span className="text-xs bg-white/90 text-green-600 px-3 py-1 rounded-full font-bold shadow-sm">
                    全勤达成！
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {TASKS.map((task, i) => (
                  <motion.div
                    key={task.key}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ease: 'easeOut' }}
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
          </div>

          {/* 底部周历 */}
          <div className="mt-5">
            <WeekCalendar refreshKey={completedCount} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        show={!!confirmTask}
        taskEmoji={confirmTask?.emoji || ''}
        taskName={confirmTask?.name || ''}
        onConfirm={() => confirmTask && handleCompleteTask(confirmTask.key)}
        onCancel={() => setConfirmTask(null)}
      />
      <StarBurst show={showCelebration} onComplete={() => setShowCelebration(false)} />
    </main>
  )
}
