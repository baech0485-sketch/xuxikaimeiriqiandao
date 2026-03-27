'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { playCompleteSound } from '@/lib/sounds'

interface ConfirmDialogProps {
  show: boolean
  taskEmoji: string
  taskName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ show, taskEmoji, taskName, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!show) return

    confirmButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, onCancel])

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
          <button
            type="button"
            aria-label="关闭确认弹窗"
            className="absolute inset-0 bg-[#02060d]/75 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            className="mission-panel relative z-10 w-full max-w-sm p-8 text-center"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] border border-amber-200/20 bg-[linear-gradient(135deg,rgba(255,209,102,0.18),rgba(255,122,162,0.14))] p-4">
              <span className="text-4xl">{taskEmoji}</span>
            </div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">task confirmation</p>
            <p id="confirm-dialog-title" className="mb-2 text-lg font-bold leading-relaxed text-slate-100">
              你完成了
              <span className="text-sky-200"> {taskName} </span>
              吗？
            </p>
            <p id="confirm-dialog-desc" className="mb-5 text-sm text-slate-400">
              确认后会记录这项任务完成，并同步更新宠物状态。
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                ref={confirmButtonRef}
                className="flex-1 rounded-2xl border border-emerald-300/30 bg-emerald-400/18 px-4 py-4 text-base font-bold text-emerald-100 transition active:scale-95 select-none"
                style={{ touchAction: 'manipulation' }}
                onClick={handleConfirm}
                onTouchEnd={handleConfirm}
              >
                完成了！
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-bold text-slate-300 transition active:scale-95 select-none"
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
