'use client'

import { useEffect } from 'react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import type { PetMood } from '@/lib/constants'

const MOOD_MAP: Record<PetMood, number> = {
  happy: 0,
  hungry: 1,
  sad: 2,
  runaway: 3,
}

interface RivePetDisplayProps {
  riveFile: string
  mood: PetMood
  isEating?: boolean
  petName: string
}

export default function RivePetDisplay({ riveFile, mood, isEating, petName }: RivePetDisplayProps) {
  const { rive, RiveComponent } = useRive({
    src: riveFile,
    stateMachines: 'PetStateMachine',
    autoplay: true,
  })

  const moodInput = useStateMachineInput(rive, 'PetStateMachine', 'mood')
  const eatingInput = useStateMachineInput(rive, 'PetStateMachine', 'isEating')
  const tapInput = useStateMachineInput(rive, 'PetStateMachine', 'isTapped')

  // 同步心情状态到 Rive
  useEffect(() => {
    if (moodInput) moodInput.value = MOOD_MAP[mood]
  }, [mood, moodInput])

  // 同步喂食状态
  useEffect(() => {
    if (eatingInput) eatingInput.value = !!isEating
  }, [isEating, eatingInput])

  const handleTap = () => {
    if (tapInput) tapInput.fire()
  }

  return (
    <div
      className="w-[160px] h-[160px] cursor-pointer select-none"
      onClick={handleTap}
      style={{ touchAction: 'manipulation' }}
      role="button"
      aria-label={`${petName} - 点击互动`}
    >
      <RiveComponent />
    </div>
  )
}
