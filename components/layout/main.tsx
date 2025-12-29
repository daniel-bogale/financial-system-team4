import { cn } from '@/lib/utils'
import { clsx } from 'clsx'

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Main({ fixed, className, fluid, ...props }: MainProps) {
  // Check if className contains a custom max-width class
  // Convert className to string to check for max-w classes
  const classNameString = className ? String(clsx(className)) : ''
  const hasCustomMaxWidth = /max-w-/.test(classNameString)

  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'px-4 py-6',

        // If layout is fixed, make the main container flex and grow
        fixed && 'flex grow flex-col overflow-hidden',

        // If layout is not fluid and no custom max-width is provided, set the default max-width
        !fluid && !hasCustomMaxWidth &&
        '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className
      )}
      {...props}
    />
  )
}

