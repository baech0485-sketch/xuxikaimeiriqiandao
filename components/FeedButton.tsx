'use client'

import { motion } from 'framer-motion'

interface FeedButtonProps {
  foodEmoji: string
  canFeed: boolean
  feedCount: number
  onFeed: () => void
  petMood: string
}

export default function FeedButton({ foodEmoji, canFeed, feedCount, onFeed, petMood }: FeedButtonProps) {
  if (petMood === 'runaway') return null

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <motion.button
          className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center text-2xl border-[3px] transition-colors
            ${canFeed
              ? 'bg-gradient-to-br from-candy-orange-light to-candy-pink-light border-white/80 shadow-kid-glow cursor-pointer'
              : 'bg-gray-100 border-gray-200/60 text-gray-400 cursor-not-allowed'
            }
          `}
          onClick={() => canFeed && onFeed()}
          whileTap={canFeed ? { scale: 0.88 } : undefined}
          animate={canFeed ? { scale: [1, 1.04, 1] } : undefined}
          transition={canFeed ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : undefined}
        >
          {foodEmoji}
        </motion.button>

        {feedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-candy-red/80 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white"
          >
            {feedCount}
          </motion.div>
        )}
      </div>
      <span className={`text-[11px] font-bold ${canFeed ? 'text-gray-500' : 'text-gray-400'}`}>
        {canFeed ? '点我喂食' : '完成任务获得食物'}
      </span>
    </div>
  )
}
