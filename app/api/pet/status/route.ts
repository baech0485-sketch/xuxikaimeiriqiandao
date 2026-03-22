import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr, calculateMood } from '@/lib/petLogic'

export async function POST() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  const todayRecord = await DailyRecord.findOne({ userId: user._id, date: today })

  // 今天已喂过且非出走状态 → 开心
  if (todayRecord && todayRecord.fedCount > 0 && user.pet.mood !== 'runaway') {
    user.pet.mood = 'happy'
    user.pet.hungryDays = 0
    await user.save()
    return NextResponse.json({ user })
  }

  // 计算连续未喂天数：只从用户注册日之后开始算
  const createdDate = new Date(user.createdAt).toISOString().split('T')[0]
  let hungryDays = 0
  const checkDate = new Date(today)

  for (let i = 1; i <= 3; i++) {
    checkDate.setDate(checkDate.getDate() - 1)
    const dateStr = checkDate.toISOString().split('T')[0]

    // 如果这一天在用户注册日之前，不算饿
    if (dateStr < createdDate) break

    const record = await DailyRecord.findOne({ userId: user._id, date: dateStr })
    if (!record || record.fedCount === 0) {
      hungryDays++
    } else {
      break
    }
  }

  user.pet.hungryDays = hungryDays

  if (user.pet.mood !== 'runaway') {
    user.pet.mood = calculateMood(hungryDays)
  }

  if (hungryDays >= 3 && user.pet.mood !== 'runaway') {
    user.pet.mood = 'runaway'
    user.stats.streak = 0
  }

  // 检查昨天是否全勤，更新streak
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (yesterdayStr >= createdDate) {
    const yesterdayRecord = await DailyRecord.findOne({ userId: user._id, date: yesterdayStr })
    if (!yesterdayRecord || !yesterdayRecord.allCompleted) {
      if (user.stats.streak > 0 && (!todayRecord || !todayRecord.allCompleted)) {
        user.stats.streak = 0
      }
    }
  }

  await user.save()
  return NextResponse.json({ user })
}
