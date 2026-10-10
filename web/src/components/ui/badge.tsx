import * as React from 'react'
import { cn } from '../../lib/utils'
export const Badge = ({ className, tone = 'neutral', ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral'|'green'|'amber'|'red'|'blue' }) => (
  <span className={cn('np-badge', 'np-badge-'+tone, className)} {...props} />
)
