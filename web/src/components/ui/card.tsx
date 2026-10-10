import * as React from 'react'
import { cn } from '../../lib/utils'
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('np-card rounded-2xl border border-slate-200/70 bg-white p-5', className)} {...props} />,
)
Card.displayName = 'Card'
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-bold text-slate-900', className)} {...props} />
)
