'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PET_MOODS } from '@/lib/constants'
import type { PetMood } from '@/lib/constants'

interface PetDisplayProps {
  petType: string
  petEmoji: string
  petImage?: string
  petImagePng?: string
  petImageEating?: string
  petImageEatingPng?: string
  petImageHungry?: string
  petImageHungryPng?: string
  petImageSad?: string
  petImageSadPng?: string
  mood: PetMood
  isEating?: boolean
  petName: string
  hungryDays: number
  recallProgress: number
}

const moodAnimations = {
  happy: {
    animate: { y: [0, -10, 0], rotate: [0, 1.5, 0, -1.5, 0] },
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
  },
  hungry: {
    animate: { x: [-2, 2, -2, 0] },
    transition: { repeat: Infinity, duration: 1.2 },
  },
  sad: {
    animate: { y: [0, 3, 0], opacity: [1, 0.75, 1], scale: [1, 0.97, 1] },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  runaway: {
    animate: { opacity: 0, scale: 0 },
    transition: { duration: 0.5 },
  },
}

export default function PetDisplay({ petEmoji, petImage, petImagePng, petImageEating, petImageEatingPng, petImageHungry, petImageHungryPng, petImageSad, petImageSadPng, mood, petName, recallProgress, isEating }: PetDisplayProps) {
  const moodInfo = PET_MOODS[mood]
  const anim = moodAnimations[mood]
  const heartCount = mood === 'happy' ? 5 : mood === 'hungry' ? 3 : 1

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <AnimatePresence mode="wait">
        {mood === 'runaway' ? (
          <motion.div
            key="runaway"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="relative mx-auto w-36 h-28 mb-4">
              <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-amber-100 to-amber-50 rounded-[50%] border border-amber-200/50" />
              <div className="absolute bottom-3 w-full text-center text-4xl opacity-20">🏠</div>
            </div>
            <div className="bg-amber-50/80 border border-dashed border-amber-200 rounded-2xl p-4 max-w-[210px] mx-auto">
              <p className="text-xs text-amber-500 mb-1.5 font-bold">📮 一封信</p>
              <p className="text-sm leading-relaxed text-amber-700/80">
                亲爱的主人，我饿了好几天了...
                <br />完成全部任务找回我吧！
              </p>
              {recallProgress > 0 && (
                <div className="mt-3 bg-white/50 rounded-xl p-2">
                  <p className="text-[10px] text-amber-400 mb-1">召回进度 {recallProgress}/3</p>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                          i < recallProgress ? 'bg-candy-mint' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pet"
            className="relative py-4"
            animate={anim.animate}
            transition={anim.transition}
          >
            {/* 柔和光晕 */}
            <div className={`absolute inset-0 -m-6 rounded-full blur-3xl opacity-15 ${
              mood === 'happy' ? 'bg-candy-yellow-light' : mood === 'hungry' ? 'bg-candy-orange-light' : 'bg-gray-200'
            }`} />

            {/* 柔和粒子 */}
            {mood === 'happy' && (
              <>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="absolute text-sm pointer-events-none opacity-50"
                    style={{ left: `${25 + i * 22}%`, top: '0px' }}
                    animate={{ y: [-5, -28], opacity: [0.5, 0], scale: [0.6, 0.9] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.7, ease: 'easeOut' }}
                  >
                    {['💕', '✨', '💖'][i]}
                  </motion.span>
                ))}
              </>
            )}

            {mood === 'sad' && (
              <motion.span
                className="absolute text-xs pointer-events-none opacity-40 right-[15%] top-[15%]"
                animate={{ y: [0, 15], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                💧
              </motion.span>
            )}

            <div className="relative">
              {petImage ? (
                <AnimatePresence mode="wait">
                  {(() => {
                    // 根据状态选择图片
                    let imgSrc = petImage;
                    let imgPng = petImagePng || '';
                    let imgKey = 'normal';

                    if (isEating && petImageEating) {
                      imgSrc = petImageEating;
                      imgPng = petImageEatingPng || '';
                      imgKey = 'eating';
                    } else if (mood === 'hungry' && petImageHungry) {
                      imgSrc = petImageHungry;
                      imgPng = petImageHungryPng || '';
                      imgKey = 'hungry';
                    } else if (mood === 'sad' && petImageSad) {
                      imgSrc = petImageSad;
                      imgPng = petImageSadPng || '';
                      imgKey = 'sad';
                    }

                    return (
                      <motion.div
                        key={imgKey}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <picture>
                          <source srcSet={imgSrc} type="image/webp" />
                          <img src={imgPng} alt={petName} className="w-[140px] h-[140px] object-contain drop-shadow-lg" />
                        </picture>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              ) : (
                <span className="text-[100px] leading-none block">{petEmoji}</span>
              )}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/5 rounded-[50%] blur-[2px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-base font-bold text-gray-600">{petName}</p>

      {/* 心情气泡 */}
      {mood !== 'runaway' && (
        <div className="relative bg-white/90 rounded-2xl px-4 py-1.5 shadow-kid">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white/90" />
          <p className="text-xs text-center text-gray-500">
            {isEating ? '好好吃呀~真幸福！' : moodInfo.message}
          </p>
        </div>
      )}

      {/* 饱食度 */}
      {mood !== 'runaway' && (
        <div className="flex gap-0.5 mt-0.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.span
              key={i}
              className="text-base"
              initial={false}
              animate={{ scale: i < heartCount ? [1, 1.15, 1] : 1, opacity: i < heartCount ? 0.85 : 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {i < heartCount ? '❤️' : '🩶'}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
