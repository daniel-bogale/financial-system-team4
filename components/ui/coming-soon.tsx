'use client'

import { Telescope } from 'lucide-react'

export function ComingSoon() {

  return (
    <div
      className={'h-[calc(100dvh-(120px))]'}
    >
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Coming Soon</h1>
        <p className='text-muted-foreground text-center'>
          Feature under development<br />
          Stay tuned for updates!
        </p>
      </div>
    </div>
  )
}
