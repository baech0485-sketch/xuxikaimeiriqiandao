# 小宠伴学 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个儿童习惯养成宠物系统，小朋友每日完成学习任务后喂养虚拟宠物，连续不喂宠物会离家出走。

**Architecture:** Next.js 14 App Router 全栈应用，前端使用 Tailwind CSS + Framer Motion 实现糖果色UI和宠物动画，后端通过 API Routes 连接 MongoDB 云数据库存储用户数据和每日打卡记录。平板横屏优先的响应式设计。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, MongoDB, Mongoose

---

## Task 1: 项目初始化与基础配置

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.env.local`

**Step 1: 初始化 Next.js 项目**

```bash
cd F:/baech0485-code/xuxikaimeiriqiandao
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

**Step 2: 安装依赖**

```bash
npm install mongoose framer-motion
```

**Step 3: 创建环境变量文件 `.env.local`**

```env
MONGODB_URI=mongodb://root:5r56rdz6@dbconn.sealosbja.site:43627/xuxikai?directConnection=true&authSource=admin
```

**Step 4: 更新 `tailwind.config.ts` 添加糖果色主题**

在 `theme.extend.colors` 中添加：
```typescript
colors: {
  candy: {
    pink: '#FFB5C2',
    blue: '#B5D8FF',
    yellow: '#FFF3B5',
    mint: '#B5FFD8',
    purple: '#D8B5FF',
    orange: '#FFD8B5',
  }
}
```

在 `theme.extend.fontFamily` 中添加：
```typescript
fontFamily: {
  kid: ['"Comic Sans MS"', '"Noto Sans SC"', 'cursive', 'sans-serif'],
}
```

**Step 5: 更新 `app/globals.css` 添加全局样式**

添加糖果色渐变背景、大圆角卡片基础样式、触控友好的按钮最小尺寸 48px。

**Step 6: 更新 `app/layout.tsx` 设置全局布局**

```tsx
// metadata: title "小宠伴学", description "儿童习惯养成宠物系统"
// 使用 font-kid 字体
// 设置 viewport 为平板优先
```

**Step 7: 验证项目启动**

```bash
npm run dev
```
Expected: 浏览器访问 localhost:3000 看到 Next.js 默认页面，无报错。

**Step 8: Commit**

```bash
git init && git add -A && git commit -m "feat: 初始化Next.js项目，配置Tailwind糖果色主题和MongoDB连接"
```

---

## Task 2: MongoDB 数据库连接与数据模型

**Files:**
- Create: `lib/mongodb.ts`
- Create: `lib/models/User.ts`
- Create: `lib/models/DailyRecord.ts`
- Create: `lib/constants.ts`

**Step 1: 创建数据库连接工具 `lib/mongodb.ts`**

```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('请在 .env.local 中设置 MONGODB_URI')
}

let cached = global as any
if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn
  }
  if (!cached.mongoose.promise) {
    cached.mongoose.promise = mongoose.connect(MONGODB_URI)
  }
  cached.mongoose.conn = await cached.mongoose.promise
  return cached.mongoose.conn
}

export default dbConnect
```

**Step 2: 创建常量配置 `lib/constants.ts`**

```typescript
export const PET_TYPES = [
  { type: 'cat', name: '小橘猫', emoji: '🐱', personality: '贪吃又黏人', food: '小鱼干', foodEmoji: '🐟' },
  { type: 'dog', name: '柯基犬', emoji: '🐶', personality: '活泼爱运动', food: '骨头饼干', foodEmoji: '🦴' },
  { type: 'rabbit', name: '小白兔', emoji: '🐰', personality: '安静爱读书', food: '胡萝卜', foodEmoji: '🥕' },
  { type: 'panda', name: '小熊猫', emoji: '🐼', personality: '憨憨的学霸', food: '竹笋糕', foodEmoji: '🎋' },
  { type: 'dragon', name: '小飞龙', emoji: '🐉', personality: '神秘又酷炫', food: '星星果', foodEmoji: '⭐' },
] as const

export const TASKS = [
  { key: 'literacy', name: '认字', emoji: '📝' },
  { key: 'math', name: '摩比爱数学', emoji: '🔢' },
  { key: 'writing', name: '写字', emoji: '✏️' },
  { key: 'reading', name: '读书', emoji: '📖' },
  { key: 'drawing', name: '画画', emoji: '🎨' },
  { key: 'skipping', name: '跳绳', emoji: '🤸' },
] as const

export const PET_MOODS = {
  happy: { label: '开心', message: '好开心！', color: '#4CAF50' },
  hungry: { label: '饿了', message: '我饿了~', color: '#FF9800' },
  sad: { label: '伤心', message: '你是不是忘了我...', color: '#9E9E9E' },
  runaway: { label: '出走', message: '你的宠物离家出走了...', color: '#F44336' },
} as const

export const RUNAWAY_DAYS = 3        // 连续3天不喂就出走
export const RECALL_DAYS = 3          // 连续3天全勤召回
```

**Step 3: 创建 User 模型 `lib/models/User.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  avatar: string
  pet: {
    type: string
    name: string
    mood: 'happy' | 'hungry' | 'sad' | 'runaway'
    hungryDays: number
    recallProgress: number  // 召回进度（0-3）
  }
  stats: {
    totalStars: number
    streak: number
    maxStreak: number
    totalDays: number
  }
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  avatar: { type: String, default: 'boy1' },
  pet: {
    type: { type: String, required: true },
    name: { type: String, required: true },
    mood: { type: String, enum: ['happy', 'hungry', 'sad', 'runaway'], default: 'happy' },
    hungryDays: { type: Number, default: 0 },
    recallProgress: { type: Number, default: 0 },
  },
  stats: {
    totalStars: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

**Step 4: 创建 DailyRecord 模型 `lib/models/DailyRecord.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

interface TaskStatus {
  done: boolean
  completedAt: string | null
}

export interface IDailyRecord extends Document {
  userId: mongoose.Types.ObjectId
  date: string                    // "2026-03-22" 格式
  tasks: {
    literacy: TaskStatus
    math: TaskStatus
    writing: TaskStatus
    reading: TaskStatus
    drawing: TaskStatus
    skipping: TaskStatus
  }
  fedCount: number                // 今日喂食次数
  allCompleted: boolean
  starsEarned: number
}

const TaskStatusSchema = new Schema({
  done: { type: Boolean, default: false },
  completedAt: { type: String, default: null },
}, { _id: false })

const DailyRecordSchema = new Schema<IDailyRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  tasks: {
    literacy: { type: TaskStatusSchema, default: () => ({}) },
    math: { type: TaskStatusSchema, default: () => ({}) },
    writing: { type: TaskStatusSchema, default: () => ({}) },
    reading: { type: TaskStatusSchema, default: () => ({}) },
    drawing: { type: TaskStatusSchema, default: () => ({}) },
    skipping: { type: TaskStatusSchema, default: () => ({}) },
  },
  fedCount: { type: Number, default: 0 },
  allCompleted: { type: Boolean, default: false },
  starsEarned: { type: Number, default: 0 },
})

// 同一用户同一天只能有一条记录
DailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema)
```

**Step 5: 验证数据库连接**

创建临时测试 API `app/api/test/route.ts`：
```typescript
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

export async function GET() {
  await dbConnect()
  return NextResponse.json({ status: 'connected' })
}
```

```bash
npm run dev
# 访问 http://localhost:3000/api/test
```
Expected: 返回 `{"status":"connected"}`

**Step 6: 删除测试API，Commit**

```bash
rm app/api/test/route.ts
git add -A && git commit -m "feat: 添加MongoDB连接、User和DailyRecord数据模型、常量配置"
```

---

## Task 3: 用户与每日打卡 API

**Files:**
- Create: `app/api/user/route.ts`
- Create: `app/api/daily/route.ts`
- Create: `app/api/pet/feed/route.ts`
- Create: `app/api/pet/status/route.ts`
- Create: `lib/petLogic.ts`

**Step 1: 创建宠物状态逻辑 `lib/petLogic.ts`**

```typescript
import { RUNAWAY_DAYS, RECALL_DAYS } from './constants'

// 计算宠物心情
export function calculateMood(hungryDays: number): 'happy' | 'hungry' | 'sad' | 'runaway' {
  if (hungryDays >= RUNAWAY_DAYS) return 'runaway'
  if (hungryDays >= 2) return 'sad'
  if (hungryDays >= 1) return 'hungry'
  return 'happy'
}

// 获取今天的日期字符串 (YYYY-MM-DD)
export function getTodayStr(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset + 8 * 3600000)  // UTC+8 北京时间
    .toISOString().split('T')[0]
}
```

**Step 2: 创建用户 API `app/api/user/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET /api/user — 获取当前用户（简化版：只有一个用户）
export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user })
}

// POST /api/user — 创建用户（领养宠物时调用）
export async function POST(req: NextRequest) {
  await dbConnect()
  const body = await req.json()
  const { name, petType, petName } = body

  // 删除旧用户（简化版：单用户系统）
  await User.deleteMany({})

  const user = await User.create({
    name,
    pet: { type: petType, name: petName, mood: 'happy', hungryDays: 0, recallProgress: 0 },
    stats: { totalStars: 0, streak: 0, maxStreak: 0, totalDays: 0 },
  })

  return NextResponse.json({ user })
}
```

**Step 3: 创建每日打卡 API `app/api/daily/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr } from '@/lib/petLogic'
import { TASKS } from '@/lib/constants'

// GET /api/daily — 获取今日打卡记录
export async function GET() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ record: null })

  const today = getTodayStr()
  let record = await DailyRecord.findOne({ userId: user._id, date: today })

  // 如果今天还没有记录，自动创建
  if (!record) {
    record = await DailyRecord.create({ userId: user._id, date: today })
  }

  return NextResponse.json({ record })
}

// POST /api/daily — 完成任务打卡
export async function POST(req: NextRequest) {
  await dbConnect()
  const { taskKey } = await req.json()

  // 校验任务key
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

  // 标记任务完成
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  record.tasks[taskKey as keyof typeof record.tasks] = { done: true, completedAt: timeStr }

  // 检查是否全部完成
  const allDone = TASKS.every(t => record!.tasks[t.key as keyof typeof record.tasks]?.done)
  if (allDone && !record.allCompleted) {
    record.allCompleted = true
    record.starsEarned = 1
    user.stats.totalStars += 1
    user.stats.totalDays += 1
    user.stats.streak += 1
    if (user.stats.streak > user.stats.maxStreak) {
      user.stats.maxStreak = user.stats.streak
    }
    await user.save()
  }

  await record.save()
  return NextResponse.json({ record, user })
}
```

**Step 4: 创建宠物喂食 API `app/api/pet/feed/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr, calculateMood } from '@/lib/petLogic'
import { RECALL_DAYS } from '@/lib/constants'

// POST /api/pet/feed — 喂养宠物
export async function POST() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  const record = await DailyRecord.findOne({ userId: user._id, date: today })

  // 必须至少完成一个任务才能喂食
  const completedCount = record ? Object.values(record.tasks).filter((t: any) => t.done).length : 0
  if (completedCount === 0) {
    return NextResponse.json({ error: '请先完成至少一个任务' }, { status: 400 })
  }

  // 如果已经喂过的次数 >= 完成的任务数，不能再喂
  if (record && record.fedCount >= completedCount) {
    return NextResponse.json({ error: '需要完成更多任务才能继续喂食' }, { status: 400 })
  }

  // 处理召回逻辑
  if (user.pet.mood === 'runaway') {
    if (record && record.allCompleted) {
      user.pet.recallProgress += 1
      if (user.pet.recallProgress >= RECALL_DAYS) {
        // 召回成功
        user.pet.mood = 'happy'
        user.pet.hungryDays = 0
        user.pet.recallProgress = 0
      }
    }
  } else {
    // 正常喂食
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
```

**Step 5: 创建宠物状态更新 API `app/api/pet/status/route.ts`**

此 API 在每次打开页面时调用，用于根据昨天是否喂食来更新宠物状态：

```typescript
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import DailyRecord from '@/lib/models/DailyRecord'
import { getTodayStr, calculateMood } from '@/lib/petLogic'

// POST /api/pet/status — 每次打开页面时更新宠物状态
export async function POST() {
  await dbConnect()
  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const today = getTodayStr()
  const todayRecord = await DailyRecord.findOne({ userId: user._id, date: today })

  // 如果今天已经喂过，宠物是开心的（除非出走状态）
  if (todayRecord && todayRecord.fedCount > 0 && user.pet.mood !== 'runaway') {
    user.pet.mood = 'happy'
    user.pet.hungryDays = 0
    await user.save()
    return NextResponse.json({ user })
  }

  // 计算连续未喂天数：从昨天往前数
  let hungryDays = 0
  const checkDate = new Date(today)

  for (let i = 1; i <= 3; i++) {
    checkDate.setDate(checkDate.getDate() - 1)
    const dateStr = checkDate.toISOString().split('T')[0]
    const record = await DailyRecord.findOne({ userId: user._id, date: dateStr })

    if (!record || record.fedCount === 0) {
      hungryDays++
    } else {
      break
    }
  }

  // 如果今天还没喂，加上今天
  if (!todayRecord || todayRecord.fedCount === 0) {
    // 不把今天算入hungryDays，只看之前的天数来决定状态
  }

  user.pet.hungryDays = hungryDays
  if (user.pet.mood !== 'runaway') {
    user.pet.mood = calculateMood(hungryDays)
  }

  // 如果之前是出走状态，检查连续天数是否重置
  if (hungryDays >= 3 && user.pet.mood !== 'runaway') {
    user.pet.mood = 'runaway'
    user.stats.streak = 0
  }

  await user.save()
  return NextResponse.json({ user })
}
```

**Step 6: 验证所有API**

```bash
npm run dev
# 测试创建用户：POST /api/user body: {"name":"测试","petType":"cat","petName":"小橘"}
# 测试获取用户：GET /api/user
# 测试每日记录：GET /api/daily
# 测试完成任务：POST /api/daily body: {"taskKey":"literacy"}
# 测试喂食：POST /api/pet/feed
```

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: 完成所有API路由 - 用户CRUD、每日打卡、宠物喂食与状态管理"
```

---

## Task 4: 领养宠物页面

**Files:**
- Create: `app/adopt/page.tsx`
- Create: `components/PetSelector.tsx`

**Step 1: 创建宠物选择组件 `components/PetSelector.tsx`**

宠物卡片横向排列，每个卡片包含：
- 大号emoji显示（80px+）
- 宠物名称
- 性格描述
- 喜欢的食物

选中状态：卡片放大 + 彩色边框 + 弹跳动画（Framer Motion scale）

点击切换选中宠物，使用 `useState` 管理选中状态。

**Step 2: 创建领养页面 `app/adopt/page.tsx`**

页面流程：
1. 顶部标题："选一只小伙伴吧！" + 可爱副标题
2. 中间：5个宠物卡片横向排列（PetSelector 组件）
3. 选中宠物后，底部显示：
   - 输入小朋友名字（大字输入框）
   - 给宠物取名字（大字输入框，预填宠物默认名称）
   - "领养回家" 大按钮（糖果色渐变，圆角）
4. 点击领养 → 调用 `POST /api/user` → 跳转到首页
5. 领养成功时播放庆祝动画（五彩纸屑效果）

使用 Framer Motion 的 `AnimatePresence` 实现流畅切换动画。

**Step 3: 在首页添加路由逻辑**

修改 `app/page.tsx`：
- 页面加载时调用 `GET /api/user`
- 如果没有用户 → 自动跳转到 `/adopt`
- 如果有用户 → 显示主界面（下一个 Task 实现）

**Step 4: 验证领养流程**

```bash
npm run dev
# 访问 localhost:3000 → 应自动跳转到 /adopt
# 选择宠物 → 输入名字 → 点击领养 → 跳转回首页
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: 完成领养宠物页面 - 5种宠物选择、取名、领养动画"
```

---

## Task 5: 宠物动画组件

**Files:**
- Create: `components/Pet/PetDisplay.tsx`
- Create: `components/Pet/PetMoodBubble.tsx`
- Create: `components/Pet/EmptyNest.tsx`

**Step 1: 创建宠物显示组件 `components/Pet/PetDisplay.tsx`**

核心组件，根据宠物类型和心情显示不同动画：

- **happy 状态**：宠物 emoji 上下轻轻弹跳（Framer Motion `animate={{ y: [0, -10, 0] }}`），配合心形飘出动效
- **hungry 状态**：宠物 emoji 左右晃动（shake 动画），眼巴巴的表情
- **sad 状态**：宠物 emoji 缓慢下沉 + 颤抖，蓝色水滴飘出
- **runaway 状态**：显示空窝 + 一封小信"我走了，完成任务才能找回我哦"

动画参数：
```typescript
const moodAnimations = {
  happy: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1.5 } },
  hungry: { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.5 } },
  sad: { y: [0, 5, 0], opacity: [1, 0.7, 1], transition: { repeat: Infinity, duration: 2 } },
}
```

宠物 emoji 尺寸：120px+，在宠物下方显示5颗心的饱食度指示器。

**Step 2: 创建心情气泡组件 `components/Pet/PetMoodBubble.tsx`**

宠物头顶的对话气泡，显示心情台词：
- 白色圆角气泡 + 小三角箭头
- 文字根据心情变化（来自 PET_MOODS 常量）
- 使用 Framer Motion fadeIn 动画

**Step 3: 创建空窝组件 `components/Pet/EmptyNest.tsx`**

宠物出走时显示：
- 空窝图案（用 CSS/emoji 组合实现）
- 一封信的效果："亲爱的主人，我饿了好几天了...完成任务就能找到我哦！"
- 召回进度条（0/3, 1/3, 2/3）
- 整体灰色调，营造思念氛围

**Step 4: 验证宠物组件各状态**

在开发工具中手动切换宠物 mood 值，确认四种状态动画都正常。

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: 完成宠物动画组件 - 4种心情状态动画、对话气泡、空窝效果"
```

---

## Task 6: 任务卡片与喂食组件

**Files:**
- Create: `components/TaskCard.tsx`
- Create: `components/FeedButton.tsx`
- Create: `components/StarBurst.tsx`

**Step 1: 创建任务卡片组件 `components/TaskCard.tsx`**

单个任务卡片，包含：
- 左侧：任务 emoji（40px）
- 中间：任务名称（18px+，友好字体）
- 右侧：完成状态（✅ 已完成 / ⬜ 未完成）

交互：
- 点击未完成的卡片 → 弹出确认对话框"你完成了 [任务名] 吗？" → 确认后标记完成
- 完成动画：卡片闪金光 + 缩放弹跳 + 星星飞出
- 已完成卡片：背景变为浅绿色，不可再次点击

Props:
```typescript
interface TaskCardProps {
  task: { key: string; name: string; emoji: string }
  done: boolean
  completedAt: string | null
  onComplete: (taskKey: string) => void
}
```

**Step 2: 创建喂食按钮组件 `components/FeedButton.tsx`**

大圆形按钮（宠物区域下方）：
- 显示当前宠物喜欢的食物emoji（60px）
- 按钮上方小文字"喂食"
- 有可喂食数量时：按钮活跃（彩色+脉冲动画）
- 无可喂食时：按钮灰色禁用
- 点击喂食动画：食物 emoji 飞向宠物 → 宠物做出吃的反应

Props:
```typescript
interface FeedButtonProps {
  foodEmoji: string
  canFeed: boolean         // 是否可以喂食
  feedCount: number        // 可喂食次数
  onFeed: () => void
}
```

**Step 3: 创建星星爆发动效组件 `components/StarBurst.tsx`**

全勤时的庆祝动画：
- 多个星星 ⭐ 从中心向四周飞散
- 大文字"太棒了！全部完成！"
- 金星 +1 动画
- 持续 2 秒后自动消失

使用 Framer Motion 的 variants 和 stagger 效果。

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: 完成任务卡片、喂食按钮和全勤庆祝动画组件"
```

---

## Task 7: 首页主界面

**Files:**
- Modify: `app/page.tsx`
- Create: `components/TopNav.tsx`
- Create: `components/WeekCalendar.tsx`

**Step 1: 创建顶部导航栏 `components/TopNav.tsx`**

固定在顶部的导航栏：
- 左侧："小宠伴学" 标题（糖果色渐变文字）
- 中间：⭐ 金星计数 + 🔥 连续天数
- 右侧：日历图标（点击跳转 `/calendar`）

样式：白色/半透明背景，柔和阴影，高度 60px。

**Step 2: 创建周日历组件 `components/WeekCalendar.tsx`**

底部周视图：
- 显示本周一到周日
- 每天一个圆形色块：
  - 绿色 ✅ = 该天全勤
  - 黄色 🟡 = 部分完成
  - 灰色 ⬜ = 未完成
  - 当天高亮边框
- 数据来源：调用 API 获取本周所有记录

```typescript
interface WeekDay {
  date: string
  dayLabel: string    // 一、二、三...
  status: 'full' | 'partial' | 'none' | 'future'
  isToday: boolean
}
```

**Step 3: 实现首页主界面 `app/page.tsx`**

整合所有组件，实现核心交互逻辑：

布局（平板横屏）：
```
┌─ TopNav ─────────────────────────────────┐
├─────────────────┬────────────────────────┤
│  PetDisplay     │  TaskCard x6           │
│  PetMoodBubble  │  (垂直列表)             │
│  FeedButton     │                        │
├─────────────────┴────────────────────────┤
│  WeekCalendar                            │
└──────────────────────────────────────────┘
```

状态管理（使用 useState + useEffect）：
```typescript
const [user, setUser] = useState(null)
const [dailyRecord, setDailyRecord] = useState(null)
const [loading, setLoading] = useState(true)
const [showCelebration, setShowCelebration] = useState(false)
```

核心交互流程：
1. `useEffect` 加载用户数据 + 今日记录 + 更新宠物状态
2. 点击任务 → `POST /api/daily` → 更新界面
3. 点击喂食 → `POST /api/pet/feed` → 播放喂食动画 → 更新宠物状态
4. 全部完成 → 触发 `StarBurst` 庆祝动画
5. 计算可喂食次数 = 已完成任务数 - 已喂食次数

**Step 4: 实现响应式布局**

- 平板横屏（≥768px）：左右两栏布局
- 手机竖屏（<768px）：上下堆叠布局（宠物在上，任务列表在下）

**Step 5: 验证完整流程**

```bash
npm run dev
```

测试流程：
1. 首次访问 → 跳转领养 → 选宠物 → 回到首页
2. 看到宠物 + 6个任务 → 点击完成任务 → 喂食 → 宠物开心
3. 完成所有任务 → 庆祝动画
4. 底部周历正确显示

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: 完成首页主界面 - 宠物区+任务列表+喂食交互+周历+响应式布局"
```

---

## Task 8: 打卡日历页面

**Files:**
- Create: `app/calendar/page.tsx`
- Create: `components/MonthCalendar.tsx`
- Create: `components/DayDetail.tsx`
- Create: `app/api/daily/history/route.ts`

**Step 1: 创建历史记录 API `app/api/daily/history/route.ts`**

```typescript
// GET /api/daily/history?month=2026-03
// 返回指定月份的所有打卡记录
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // "2026-03"

  const user = await User.findOne().sort({ createdAt: -1 })
  const records = await DailyRecord.find({
    userId: user._id,
    date: { $regex: `^${month}` }
  })

  return NextResponse.json({ records })
}
```

**Step 2: 创建月历组件 `components/MonthCalendar.tsx`**

网格布局的月日历：
- 顶部：月份导航（← 上月 | 2026年3月 | 下月 →）
- 7列网格（日一二三四五六）
- 每天一个方格：
  - 绿色 + ✅ = 全勤
  - 黄色 + 数字 = 部分完成（显示完成数）
  - 灰色 = 未完成
  - 今天 = 高亮蓝色边框
  - 未来日期 = 淡灰色

点击某天 → 弹出 DayDetail 浮层。

**Step 3: 创建日详情组件 `components/DayDetail.tsx`**

弹出浮层，显示某天的详细任务完成情况：
- 日期标题："3月22日 周六"
- 6个任务的完成状态列表
- 已完成的显示完成时间
- 底部显示是否全勤、获得金星数

**Step 4: 实现日历页面 `app/calendar/page.tsx`**

- 顶部返回首页按钮
- 统计面板：总打卡天数、连续天数、总金星数
- MonthCalendar 组件
- DayDetail 弹层

**Step 5: 验证日历功能**

```bash
npm run dev
# 访问 /calendar
# 切换月份，点击有记录的日期查看详情
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: 完成打卡日历页面 - 月历视图、日详情弹层、历史记录API"
```

---

## Task 9: 宠物状态每日更新逻辑

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/api/pet/status/route.ts`
- Create: `app/api/daily/week/route.ts`

**Step 1: 创建周记录 API `app/api/daily/week/route.ts`**

```typescript
// GET /api/daily/week — 返回本周（周一到今天）的打卡记录
// 用于首页底部周历组件
```

**Step 2: 完善宠物状态更新逻辑**

修改 `app/api/pet/status/route.ts`，确保以下场景正确处理：

1. **新的一天打开APP**：检查昨天是否喂食，更新 hungryDays
2. **连续多天未使用**：计算总共连续未喂天数
3. **出走后的召回**：tracking recallProgress
4. **连续打卡天数中断**：如果昨天未全勤，streak 重置为 0

**Step 3: 首页加载时自动调用状态更新**

修改 `app/page.tsx`，在 useEffect 中：
1. 先调用 `POST /api/pet/status` 更新宠物状态
2. 再获取用户和今日记录
3. 获取本周记录（周历组件用）

**Step 4: 验证状态流转**

手动修改数据库中的 hungryDays 值，验证：
- hungryDays=0 → happy
- hungryDays=1 → hungry
- hungryDays=2 → sad
- hungryDays=3 → runaway

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: 完善宠物状态每日更新逻辑、周记录API、连续打卡中断处理"
```

---

## Task 10: 视觉打磨与动画完善

**Files:**
- Modify: `app/globals.css`
- Modify: `components/Pet/PetDisplay.tsx`
- Modify: `components/TaskCard.tsx`
- Modify: `components/FeedButton.tsx`
- Modify: `app/adopt/page.tsx`

**Step 1: 添加背景装饰**

- 首页背景：柔和的糖果色渐变（浅蓝→浅粉渐变）
- 漂浮的云朵装饰（CSS animation）
- 卡片区域：白色圆角容器 + 柔和阴影

**Step 2: 完善宠物动画**

- 喂食动画：食物emoji从按钮飞向宠物位置 → 宠物做"啊呜"表情 → 心心飘出
- 宠物呼吸动画：持续的轻微缩放（scale 1.0 ↔ 1.03）
- 心情切换时的过渡动画（淡入淡出）

**Step 3: 任务完成动效**

- 点击完成任务：卡片闪光效果 + 弹跳缩放
- 食物+1 的飘字动画（类似游戏得分效果）
- 全勤庆祝：全屏五彩纸屑 + 大金星旋转出现

**Step 4: 喂食按钮动效**

- 待喂食时：按钮脉冲呼吸动画（引导点击）
- 食物上方显示小数字气泡（可喂食数量）
- 点击时：按钮缩小→弹回 + 食物飞出动画

**Step 5: 领养页面动效**

- 宠物卡片 hover/选中：弹跳放大 + 彩色光环
- 确认领养：宠物飞入屏幕中央 + 爱心爆发
- 页面过渡：Framer Motion page transitions

**Step 6: 验证所有动画流畅**

在平板设备或平板模拟器上测试全部交互动画，确认流畅无卡顿。

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: 完成视觉打磨 - 糖果色背景、喂食动画、完成动效、全勤庆祝"
```

---

## Task 11: 确认对话框与取消打卡

**Files:**
- Create: `components/ConfirmDialog.tsx`
- Modify: `components/TaskCard.tsx`

**Step 1: 创建确认对话框 `components/ConfirmDialog.tsx`**

可爱风格的确认对话框：
- 圆角白色卡片，居中弹出
- 背景半透明遮罩
- 标题：任务emoji + "你完成了 [任务名] 吗？"
- 两个大按钮："完成了！✅" / "还没有 ❌"
- Framer Motion 弹入动画

**Step 2: 在 TaskCard 中集成确认对话框**

点击任务卡片时弹出确认，确认后才调用 API 标记完成。

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: 添加任务完成确认对话框"
```

---

## Task 12: 最终测试与优化

**Files:**
- Modify: 各组件文件（根据测试结果修复）

**Step 1: 端到端流程测试**

完整测试以下流程：
1. 首次访问 → 领养页面 → 选择宠物 → 取名 → 领养成功 → 回到首页
2. 首页显示宠物（happy状态） + 6个待完成任务
3. 逐个完成任务 → 每次确认 → 食物+1 → 喂食宠物
4. 全部完成 → 庆祝动画 → 金星+1 → 连续天数+1
5. 底部周历正确标记今天为绿色
6. 点击日历图标 → 月历页面 → 点击今天 → 详情正确
7. 返回首页 → 数据一致

**Step 2: 宠物状态测试**

通过数据库直接修改数据，验证：
- 1天不喂 → hungry 状态 + 对应动画
- 2天不喂 → sad 状态 + 对应动画
- 3天不喂 → runaway 状态 + 空窝显示
- 出走后连续3天全勤 → 宠物召回

**Step 3: 平板适配测试**

使用浏览器开发工具模拟 iPad（1024x768）：
- 横屏布局正确（左宠物右任务）
- 触控区域足够大（≥48px）
- 字体清晰可读（≥18px）

**Step 4: 性能优化**

- 检查动画是否有卡顿
- 确保 MongoDB 连接不重复创建（使用缓存）
- 图片/emoji 渲染性能正常

**Step 5: 修复发现的问题**

根据测试结果修复所有 bug。

**Step 6: 最终 Commit**

```bash
git add -A && git commit -m "feat: 完成最终测试与优化 - 端到端测试通过、平板适配、性能优化"
```

---

## 实施总结

| Task | 内容 | 预计文件数 |
|------|------|-----------|
| 1 | 项目初始化与配置 | 5 |
| 2 | MongoDB连接与数据模型 | 4 |
| 3 | API路由（用户/打卡/喂食/状态） | 5 |
| 4 | 领养宠物页面 | 2 |
| 5 | 宠物动画组件 | 3 |
| 6 | 任务卡片与喂食组件 | 3 |
| 7 | 首页主界面 | 3 |
| 8 | 打卡日历页面 | 4 |
| 9 | 宠物状态每日更新逻辑 | 3 |
| 10 | 视觉打磨与动画完善 | 5 |
| 11 | 确认对话框 | 2 |
| 12 | 最终测试与优化 | - |

**总计**：约 39 个文件，12 个 Task，12 次 commit
