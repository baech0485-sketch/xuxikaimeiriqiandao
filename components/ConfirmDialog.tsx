'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback } from 'react'
import { playCompleteSound } from '@/lib/sounds'

interface ConfirmDialogProps {
  show: boolean
  taskEmoji: string
  taskName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ show, taskEmoji, taskName, onConfirm, onCancel }: ConfirmDialogProps) {
  const handleConfirm = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playCompleteSound()
    onConfirm()
  }, [onConfirm])

  const handleCancel = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }, [onCancel])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/15 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            className="relative z-10 bg-white rounded-3xl p-8 shadow-kid-lg max-w-sm w-full text-center"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-candy-yellow-light/60 to-candy-pink-light/60 flex items-center justify-center p-4">
              <span className="text-4xl">{taskEmoji}</span>
            </div>
            <p className="text-lg font-bold text-gray-600 mb-5 leading-relaxed">
              你完成了
              <span className="text-candy-pink"> {taskName} </span>
              吗？
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 btn-kid bg-candy-mint/80 text-white shadow-kid text-base active:scale-95 select-none"
                style={{ touchAction: 'manipulation' }}
                onClick={handleConfirm}
                onTouchEnd={handleConfirm}
              >
                完成了！
              </button>
              <button
                className="flex-1 btn-kid bg-gray-100 text-gray-400 text-base active:scale-95 select-none"
                style={{ touchAction: 'manipulation' }}
                onClick={handleCancel}
                onTouchEnd={handleCancel}
              >
                还没有
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
