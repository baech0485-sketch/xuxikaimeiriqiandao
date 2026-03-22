import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  return NextResponse.json({ user: user || null })
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const { name, petType, petName } = await req.json()

  await User.deleteMany({})

  const user = await User.create({
    name,
    pet: { type: petType, name: petName, mood: 'happy', hungryDays: 0, recallProgress: 0 },
    stats: { totalStars: 0, streak: 0, maxStreak: 0, totalDays: 0 },
  })

  return NextResponse.json({ user })
}
