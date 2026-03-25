import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'

export async function POST(req: NextRequest) {
  await dbConnect()
  const { date } = await req.json()

  if (!date) {
    return NextResponse.json({ error: '缺少日期参数' }, { status: 400 })
  }

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const record = await DailyRecord.findOne({ userId: user._id, date })
  if (!record) {
    return NextResponse.json({ error: '该日期无记录' }, { status: 404 })
  }

  if (!record.allCompleted) {
    return NextResponse.json({ error: '该日未达标' }, { status: 400 })
  }

  if (record.starCollected) {
    return NextResponse.json({ error: '已收集', user, alreadyCollected: true })
  }

  record.starCollected = true
  record.starsEarned = 1
  user.stats.totalStars += 1

  await record.save()
  await user.save()

  return NextResponse.json({ user, collected: true })
}
