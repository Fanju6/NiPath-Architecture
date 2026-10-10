import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'
export const Tabs = TabsPrimitive.Root
export const TabsList = ({className,...props}:React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => <TabsPrimitive.List className={cn('flex gap-1 rounded-xl bg-slate-100 p-1',className)} {...props}/>
export const TabsTrigger = ({className,...props}:React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => <TabsPrimitive.Trigger className={cn('rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm',className)} {...props}/>
export const TabsContent=TabsPrimitive.Content
