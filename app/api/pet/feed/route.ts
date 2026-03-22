import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr } from '@/lib/petLogic'
import { TASKS } from '@/lib/constants'

export async function POST() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  const record = await DailyRecord.findOne({ userId: user._id, date: today })

  const completedCount = record
    ? TASKS.filter(t => {
        const td = record.tasks[t.key as keyof typeof record.tasks]
        return td && td.done
      }).length
    : 0

  if (completedCount === 0) {
    return NextResponse.json({ error: '请先完成至少一个任务' }, { status: 400 })
  }

  if (record && record.fedCount >= completedCount) {
    return NextResponse.json({ error: '需要完成更多任务才能继续喂食' }, { status: 400 })
  }

  if (user.pet.mood === 'runaway') {
    if (record && record.allCompleted) {
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

  if (record) {
    record.fedCount += 1
    await record.save()
  }

  await user.save()
  return NextResponse.json({ user, fedCount: record?.fedCount || 0 })
}
