import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr } from '@/lib/petLogic'

export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ records: [] })

  const today = getTodayStr()
  const todayDate = new Date(today)
  const dayOfWeek = todayDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const monday = new Date(todayDate)
  monday.setDate(monday.getDate() - mondayOffset)

  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const startDate = monday.toISOString().split('T')[0]
  const endDate = sunday.toISOString().split('T')[0]

  const records = await DailyRecord.find({
    userId: user._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 })

  const res = NextResponse.json({ records, startDate, endDate, today })
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}
