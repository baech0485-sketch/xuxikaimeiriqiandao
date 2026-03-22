import { RUNAWAY_DAYS } from './constants'
import type { PetMood } from './constants'

export function calculateMood(hungryDays: number): PetMood {
  if (hungryDays >= RUNAWAY_DAYS) return 'runaway'
  if (hungryDays >= 2) return 'sad'
  if (hungryDays >= 1) return 'hungry'
  return 'happy'
}

export function getTodayStr(): string {
  const now = new Date()
  const beijing = new Date(now.getTime() + 8 * 3600000 + now.getTimezoneOffset() * 60000)
  return beijing.toISOString().split('T')[0]
}

export function getDateStr(date: Date): string {
  const beijing = new Date(date.getTime() + 8 * 3600000 + date.getTimezoneOffset() * 60000)
  return beijing.toISOString().split('T')[0]
}
