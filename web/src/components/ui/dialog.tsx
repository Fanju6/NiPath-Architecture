import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>,React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className,children,...props },ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[3px] data-[state=open]:animate-in" />
    <DialogPrimitive.Content ref={ref} className={cn('fixed left-1/2 top-1/2 z-50 w-[calc(100vw-30px)] max-w-[490px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto',className)} {...props}>
      {children}
      <DialogPrimitive.Close aria-label="关闭弹窗" className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={18}/></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName='DialogContent'
