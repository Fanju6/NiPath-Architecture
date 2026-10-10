import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

// shadcn/ui NativeSelect convention: keep a native control for mobile OS pickers.
type NativeSelectProps = Omit<React.ComponentPropsWithoutRef<'select'>, 'size'> & {
  size?: 'default' | 'sm'
  wrapperClassName?: string
}
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, wrapperClassName, size = 'default', ...props }, ref) => (
    <div className={cn('group/native-select relative w-full has-[select:disabled]:opacity-50', wrapperClassName)} data-slot="native-select-wrapper">
      <select
        ref={ref}
        data-slot="native-select"
        data-size={size}
        className={cn(
          'h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 data-[size=sm]:h-8 dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-60" aria-hidden="true" />
    </div>
  ),
)
NativeSelect.displayName = 'NativeSelect'
function NativeSelectOption(props: React.ComponentPropsWithoutRef<'option'>) {
  return <option data-slot="native-select-option" {...props} />
}
export { NativeSelect, NativeSelectOption }
