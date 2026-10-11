import * as React from 'react'
import { SheetContent } from '@/components/ui/sheet'

/**
 * Keep bottom sheets inside the visible (not layout) viewport while Android's
 * software keyboard is open. The visualViewport shrink is not always reflected
 * in position:fixed coordinates, particularly inside Android WebView.
 */
function useVisualKeyboard(open:boolean){
 const [metrics,setMetrics]=React.useState({bottom:0,height:0})
 React.useEffect(()=>{
   if(!open){setMetrics({bottom:0,height:0});return}
   const viewport=window.visualViewport
   const measure=()=>{
     const inner=window.innerHeight
     const visible=viewport?.height??inner
     const offset=viewport?.offsetTop??0
     // Either adjustResize (bottom 0) or overlay keyboard (bottom > 0).
     const bottom=Math.max(0,Math.round(inner-visible-offset))
     setMetrics({bottom,height:Math.max(220,Math.floor(visible-12))})
   }
   measure()
   viewport?.addEventListener('resize',measure)
   viewport?.addEventListener('scroll',measure)
   window.addEventListener('resize',measure)
   const onFocus=(event:FocusEvent)=>{
     const target=event.target
     if(!(target instanceof HTMLElement)||!target.closest('[data-slot="sheet-content"]'))return
     measure()
     requestAnimationFrame(()=>{
       target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})
     })
   }
   document.addEventListener('focusin',onFocus)
   return ()=>{
     viewport?.removeEventListener('resize',measure)
     viewport?.removeEventListener('scroll',measure)
     window.removeEventListener('resize',measure)
     document.removeEventListener('focusin',onFocus)
   }
 },[open])
 return metrics
}

type KeyboardSheetProps=React.ComponentProps<typeof SheetContent>&{open:boolean}
export function KeyboardAwareSheetContent({open,style,className='',children,...rest}:KeyboardSheetProps){
 const {bottom,height}=useVisualKeyboard(open)
 return <SheetContent
   {...rest}
   data-testid="keyboard-aware-sheet"
   className={`max-h-[90dvh] gap-4 overflow-y-auto overscroll-contain rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))] ${className}`}
   style={{...style,bottom:bottom+'px',maxHeight:height?height+'px':undefined}}
 >
   {children}
 </SheetContent>
}
