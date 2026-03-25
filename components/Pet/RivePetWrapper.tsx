'use client'

import dynamic from 'next/dynamic'
import type { PetMood } from '@/lib/constants'

const RivePetDisplay = dynamic(() => import('./RivePetDisplay'), {
  ssr: false,
  loading: () => (
    <div className="w-[160px] h-[160px] flex items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-white/50 animate-pulse" />
    </div>
  ),
})

interface RivePetWrapperProps {
  riveFile: string
  mood: PetMood
  isEating?: boolean
  petName: string
}

export default function RivePetWrapper(props: RivePetWrapperProps) {
  return <RivePetDisplay {...props} />
}
