'use client'

interface ControlNotesProps {
  dailyGoal: number
}

export default function ControlNotes({ dailyGoal }: ControlNotesProps) {
  return (
    <div className="clay-card p-6">
      <div className="clay-tag mb-3">Tips</div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
        <div className="clay-outline p-4 bg-clay-primary-light/30">
          <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">达标条件</p>
          <p className="mt-2 text-base font-bold text-clay-text">每日完成 {dailyGoal} 个任务</p>
        </div>
        <div className="clay-outline p-4 bg-clay-pink-light/30">
          <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">投喂规则</p>
          <p className="mt-2 text-base font-bold text-clay-text">每完成一项任务，就可投喂一次</p>
        </div>
        <div className="clay-outline p-4 bg-clay-gold-light/30">
          <p className="text-xs font-bold uppercase tracking-widest text-clay-text-muted">星星奖励</p>
          <p className="mt-2 text-base font-bold text-clay-text">整天达标后可领取 1 颗星星</p>
        </div>
      </div>
    </div>
  )
}
