let audioCtx: AudioContext | null = null

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
    tone(523, 0.15, t, 0.25, 'sine')        // C5
    tone(659, 0.28, t + 0.12, 0.2, 'sine')  // E5
  } catch { /* 静默降级 */ }
}

/** 全勤庆祝音：上行琶音小号角 C5 → E5 → G5 → C6 + 闪光 */
export function playCelebrationSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(523, 0.15, t, 0.2, 'sine')              // C5
    tone(659, 0.15, t + 0.1, 0.2, 'sine')        // E5
    tone(784, 0.15, t + 0.2, 0.22, 'sine')       // G5
    tone(1047, 0.45, t + 0.3, 0.25, 'sine')      // C6（延长）
    tone(1319, 0.35, t + 0.35, 0.1, 'triangle')  // E6 闪光音
  } catch { /* 静默降级 */ }
}

/** 触摸宠物音：可爱的短促"咕"声 */
export function playPetTapSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(880, 0.08, t, 0.15, 'sine')       // A5 短促
    tone(1175, 0.12, t + 0.06, 0.12, 'triangle') // D6 尾音
  } catch { /* 静默降级 */ }
}

/** 收集星星音：上扬滑音 + 叮 */
export function playCollectSound() {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime
    tone(659, 0.1, t, 0.18, 'sine')        // E5
    tone(880, 0.1, t + 0.08, 0.18, 'sine') // A5
    tone(1175, 0.2, t + 0.16, 0.22, 'triangle') // D6 叮
  } catch { /* 静默降级 */ }
}
