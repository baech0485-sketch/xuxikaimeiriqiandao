let audioCtx: AudioContext | null = null

const SOUND_LEVELS = {
  completePrimary: 0.4,
  completeSecondary: 0.34,
  celebrationMain: 0.3,
  celebrationMid: 0.28,
  celebrationHigh: 0.3,
  celebrationAccent: 0.16,
  petTapPrimary: 0.22,
  petTapSecondary: 0.18,
  collectPrimary: 0.24,
  collectSecondary: 0.24,
  collectAccent: 0.3,
} as const

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function tone(
  freq: number,
  duration: number,
  startTime: number,
  volume = 0.3,
  type: OscillatorType = 'sine',
) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

/** 任务完成音：清脆双音叮咚 C5 → E5 */
export function playCompleteSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(523, 0.15, t, SOUND_LEVELS.completePrimary, 'sine')        // C5
    tone(659, 0.28, t + 0.12, SOUND_LEVELS.completeSecondary, 'sine')  // E5
  } catch { /* 静默降级 */ }
}

/** 全勤庆祝音：上行琶音小号角 C5 → E5 → G5 → C6 + 闪光 */
export function playCelebrationSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(523, 0.15, t, SOUND_LEVELS.celebrationMain, 'sine')              // C5
    tone(659, 0.15, t + 0.1, SOUND_LEVELS.celebrationMid, 'sine')        // E5
    tone(784, 0.15, t + 0.2, SOUND_LEVELS.celebrationHigh, 'sine')       // G5
    tone(1047, 0.45, t + 0.3, SOUND_LEVELS.celebrationHigh, 'sine')      // C6（延长）
    tone(1319, 0.35, t + 0.35, SOUND_LEVELS.celebrationAccent, 'triangle')  // E6 闪光音
  } catch { /* 静默降级 */ }
}

/** 触摸宠物音：可爱的短促"咕"声 */
export function playPetTapSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(880, 0.08, t, SOUND_LEVELS.petTapPrimary, 'sine')       // A5 短促
    tone(1175, 0.12, t + 0.06, SOUND_LEVELS.petTapSecondary, 'triangle') // D6 尾音
  } catch { /* 静默降级 */ }
}

/** 收集星星音：上扬滑音 + 叮 */
export function playCollectSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(659, 0.1, t, SOUND_LEVELS.collectPrimary, 'sine')        // E5
    tone(880, 0.1, t + 0.08, SOUND_LEVELS.collectSecondary, 'sine') // A5
    tone(1175, 0.2, t + 0.16, SOUND_LEVELS.collectAccent, 'triangle') // D6 叮
  } catch { /* 静默降级 */ }
}
