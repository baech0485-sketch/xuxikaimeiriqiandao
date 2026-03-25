'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TopNavProps {
  totalStars: number
  streak: number
  childName?: string
  starBounce?: boolean
}

export default function TopNav({ totalStars, streak, childName, starBounce }: TopNavProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    }
  }, [])

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
                <p className="text-xs text-gray-400 leading-tight mt-0.5">
                  <span className="text-sm font-bold bg-gradient-to-r from-candy-orange to-candy-pink bg-clip-text text-transparent">{childName}</span>
                  <span className="ml-0.5">的小天地</span>
                </p>
              )}
            </div>
          </div>

          {/* 右侧统计区 */}
          <div className="flex items-center gap-3">
            <motion.div
              id="star-counter"
              className="flex items-center gap-1.5 bg-gradient-to-br from-candy-yellow-light/80 to-candy-yellow-light/40 px-4 py-2 rounded-2xl shadow-kid"
              animate={starBounce ? { scale: [1, 1.3, 0.9, 1.15, 1] } : {}}
              transition={starBounce ? { duration: 0.5, ease: 'easeOut' } : {}}
            >
              <span className="text-lg">⭐</span>
              <span className="font-bold text-amber-600 text-base">{totalStars}</span>
            </motion.div>
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
            <a
              href="/growth"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-candy-pink-light/80 to-candy-yellow-light/50 flex items-center justify-center text-xl shadow-kid hover:shadow-kid-lg hover:scale-105 active:scale-95 transition-all"
            >
              📏
            </a>
            <button
              onClick={toggleFullscreen}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-candy-purple-light/60 to-candy-mint-light/50 flex items-center justify-center shadow-kid hover:shadow-kid-lg hover:scale-105 active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}
              title={isFullscreen ? '退出全屏' : '全屏模式'}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
