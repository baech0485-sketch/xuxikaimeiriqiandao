'use client'

interface TopNavProps {
  totalStars: number
  streak: number
  childName?: string
}

export default function TopNav({ totalStars, streak, childName }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 px-4 py-2">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-kid px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-candy-mint-light to-candy-blue-light flex items-center justify-center text-lg">
              🐾
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-600 leading-tight">小宠伴学</h1>
              {childName && <p className="text-[11px] text-gray-400 leading-tight">{childName}的小天地</p>}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-candy-yellow-light/60 px-3 py-1.5 rounded-xl">
              <span className="text-sm">⭐</span>
              <span className="font-bold text-gray-500 text-sm">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1 bg-candy-orange-light/60 px-3 py-1.5 rounded-xl">
              <span className="text-sm">🔥</span>
              <span className="font-bold text-gray-500 text-sm">{streak}天</span>
            </div>
            <a
              href="/calendar"
              className="w-10 h-10 rounded-xl bg-candy-blue-light/50 flex items-center justify-center text-base hover:scale-105 active:scale-95 transition-transform"
            >
              📅
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
