import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

// shadcn/ui Badge variants with NiPath's existing "tone" status API.
export const badgeVariants = cva(
  'np-badge inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 text-xs font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white',
        outline: 'border-border text-foreground',
      },
      tone: {
        neutral: 'bg-muted text-muted-foreground',
        green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        red: 'bg-destructive/10 text-destructive',
        blue: 'bg-primary/10 text-primary',
      },
    },
    defaultVariants: { variant: 'secondary', tone: null },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue'
  }

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant ?? 'secondary'}
      className={cn(badgeVariants({ variant, tone: tone ?? null }), className)}
      {...props}
    />
  )
}
