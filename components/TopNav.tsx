'use client'

interface TopNavProps {
  totalStars: number
  streak: number
  childName?: string
}

export default function TopNav({ totalStars, streak, childName }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 px-4 py-2.5">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-kid-lg px-6 py-3.5 flex items-center justify-between">
          {/* 左侧品牌区 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-candy-mint-light via-candy-blue-light to-candy-pink-light flex items-center justify-center text-2xl shadow-kid">
              🐾
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent leading-tight">
                小宠伴学
              </h1>
              {childName && (
                <p className="text-xs text-gray-400 leading-tight mt-0.5">{childName}的小天地</p>
              )}
            </div>
          </div>

          {/* 右侧统计区 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gradient-to-br from-candy-yellow-light/80 to-candy-yellow-light/40 px-4 py-2 rounded-2xl shadow-kid">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-amber-600 text-base">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-br from-candy-orange-light/80 to-candy-orange-light/40 px-4 py-2 rounded-2xl shadow-kid">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-orange-500 text-base">{streak}天</span>
            </div>
            <a
              href="/calendar"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-candy-blue-light/80 to-candy-purple-light/50 flex items-center justify-center text-xl shadow-kid hover:shadow-kid-lg hover:scale-105 active:scale-95 transition-all"
            >
              📅
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
