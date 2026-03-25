import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import GrowthRecord from '@/lib/models/GrowthRecord'

export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ records: [], user: null })

  const records = await GrowthRecord.find({ userId: user._id }).sort({ date: 1 })
  return NextResponse.json({ records, user: { name: user.name, birthday: user.birthday || '' } })
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const { date, height, weight, birthday } = await req.json()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  // 更新生日（如果提供）
  if (birthday && birthday !== user.birthday) {
    user.birthday = birthday
    await user.save()
  }

  if (!date || !height || !weight) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 如果同日期已存在则更新
  let record = await GrowthRecord.findOne({ userId: user._id, date })
  if (record) {
    record.height = height
    record.weight = weight
    await record.save()
  } else {
    record = await GrowthRecord.create({ userId: user._id, date, height, weight })
  }

  const records = await GrowthRecord.find({ userId: user._id }).sort({ date: 1 })
  return NextResponse.json({ record, records })
}

export async function DELETE(req: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })

  await GrowthRecord.findByIdAndDelete(id)

  const user = await User.findOne().sort({ createdAt: -1 })
  const records = user ? await GrowthRecord.find({ userId: user._id }).sort({ date: 1 }) : []
  return NextResponse.json({ records })
}
