import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'

export async function GET(req: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user || !month) return NextResponse.json({ records: [] })

  const records = await DailyRecord.find({
    userId: user._id,
    date: { $regex: `^${month}` },
  }).sort({ date: 1 })

  return NextResponse.json({ records })
}
