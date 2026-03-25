import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr } from '@/lib/petLogic'
import { TASKS, DAILY_GOAL } from '@/lib/constants'

export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ record: null })

  const today = getTodayStr()
  let record = await DailyRecord.findOne({ userId: user._id, date: today })

  if (!record) {
    record = await DailyRecord.create({ userId: user._id, date: today })
  }

  return NextResponse.json({ record })
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const { taskKey } = await req.json()

  const validKeys = TASKS.map(t => t.key)
  if (!validKeys.includes(taskKey)) {
    return NextResponse.json({ error: '无效的任务' }, { status: 400 })
  }

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  let record = await DailyRecord.findOne({ userId: user._id, date: today })
  if (!record) {
    record = await DailyRecord.create({ userId: user._id, date: today })
  }

  // 如果已经完成则不重复
  const taskData = record.tasks[taskKey as keyof typeof record.tasks]
  if (taskData && taskData.done) {
    return NextResponse.json({ record, user, alreadyDone: true })
  }

  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  record.tasks[taskKey as keyof typeof record.tasks] = { done: true, completedAt: timeStr }
  record.markModified('tasks')

  const doneCount = TASKS.filter(t => {
    const td = record!.tasks[t.key as keyof typeof record.tasks]
    return td && td.done
  }).length

  const goalReached = doneCount >= DAILY_GOAL

  if (goalReached && !record.allCompleted) {
    record.allCompleted = true
    user.stats.totalDays += 1
    user.stats.streak += 1
    if (user.stats.streak > user.stats.maxStreak) {
      user.stats.maxStreak = user.stats.streak
    }
    await user.save()
  }

  await record.save()
  return NextResponse.json({ record, user, allDone: goalReached })
}
