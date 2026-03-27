'use client'

interface ControlNotesProps {
  dailyGoal: number
}

export default function ControlNotes({ dailyGoal }: ControlNotesProps) {
  return (
    <div className="mission-panel p-6">
      <div className="mission-tag mb-3">control notes</div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
        <div className="mission-card-outline p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">达标条件</p>
          <p className="mt-2 text-base font-bold text-white">每日完成 {dailyGoal} 个任务</p>
        </div>
        <div className="mission-card-outline p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">补给逻辑</p>
          <p className="mt-2 text-base font-bold text-white">每完成一项任务，就可投喂一次</p>
        </div>
        <div className="mission-card-outline p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">回收奖励</p>
          <p className="mt-2 text-base font-bold text-white">整天达标后可领取 1 枚星标</p>
        </div>
      </div>
    </div>
  )
}
