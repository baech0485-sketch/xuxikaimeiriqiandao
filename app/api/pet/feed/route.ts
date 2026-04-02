import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr } from '@/lib/petLogic'
import { TASKS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  await dbConnect()
  const { taskKey } = await req.json()

  const validKeys = TASKS.map(t => t.key)
  if (!taskKey || !validKeys.includes(taskKey)) {
    return NextResponse.json({ error: '无效的任务' }, { status: 400 })
  }

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  const record = await DailyRecord.findOne({ userId: user._id, date: today })

  if (!record) {
    return NextResponse.json({ error: '今日无记录' }, { status: 400 })
  }

  // 检查该任务是否已完成
  const taskData = record.tasks[taskKey as keyof typeof record.tasks]
  if (!taskData || !taskData.done) {
    return NextResponse.json({ error: '该任务尚未完成' }, { status: 400 })
  }

  // 检查该任务的食物是否已投喂
  const fedTasks: string[] = record.fedTasks || []
  if (fedTasks.includes(taskKey)) {
    return NextResponse.json({ error: '该食物已投喂', alreadyFed: true })
  }

  // 投喂
  fedTasks.push(taskKey)
  record.fedTasks = fedTasks
  record.fedCount = fedTasks.length

  if (user.pet.mood === 'runaway') {
    if (record.allCompleted && record.fedCount === 1) {
      user.pet.recallProgress = (user.pet.recallProgress || 0) + 1
      if (user.pet.recallProgress >= 3) {
        user.pet.mood = 'happy'
        user.pet.hungryDays = 0
        user.pet.recallProgress = 0
      }
    }
  } else {
    user.pet.hungryDays = 0
    user.pet.mood = 'happy'
  }

  await record.save()
  await user.save()

  return NextResponse.json({ user, record })
}
