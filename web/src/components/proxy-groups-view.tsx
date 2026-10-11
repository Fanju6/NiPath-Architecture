import * as React from 'react'
import { Activity, Check, ChevronDown, ChevronRight, LayoutGrid, List, Pencil, Search } from 'lucide-react'
import { useUI } from '@/store/use-ui'
import { latencyText } from '@/lib/model'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Group = ReturnType<typeof useUI.getState>['config']['outbounds'][number]
type Props = {
  onEdit?: (tag: string) => void
  className?: string
}

const groupLabel: Record<Group['type'], string> = {
  selector: '手动选择',
  urltest: '自动测速',
  'load-balance': '负载均衡',
}

/** FlClash-like "list" (expand in place) and "tab" (groups as tabs).
 * These two view modes are navigation presentations only. They do not alter
 * any single-source sing-box JSON or create extra runtime state.
 */
export function ProxyGroupsView({ onEdit, className = '' }: Props) {
  const { config, nodes, selected, selectNode, testGroup, proxyViewMode, setProxyViewMode } = useUI()
  const [query, setQuery] = React.useState('')
  const [expanded, setExpanded] = React.useState<string[]|null>(null)
  const [tab, setTab] = React.useState('')
  const groups = config.outbounds
  const filtered = groups.filter(group => {
    const q=query.trim().toLocaleLowerCase()
    if (!q) return true
    return group.tag.toLocaleLowerCase().includes(q) ||
      group.outbounds.some(tag => tag.toLocaleLowerCase().includes(q) ||
        nodes.some(node => node.tag===tag && node.name.toLocaleLowerCase().includes(q)))
  })
  const activeTab = filtered.some(group => group.tag===tab) ? tab : filtered[0]?.tag
  const getName=(tag:string)=>nodes.find(n=>n.tag===tag)?.name || tag
  const toggle=(tag:string)=>setExpanded(prev=>{
    const current=prev??(groups[0]?[groups[0].tag]:[])
    return current.includes(tag)?current.filter(k=>k!==tag):[...current,tag]
  })
  const isExpanded=(tag:string)=>expanded===null?tag===groups[0]?.tag:expanded.includes(tag)

  // "Expand all" / "Collapse all" applies only to the list presentation.
  const expandAll=()=>setExpanded(filtered.map(g=>g.tag))
  const collapseAll=()=>setExpanded([])

  const members=(group:Group)=>{
    const q=query.trim().toLocaleLowerCase()
    const items=q && !group.tag.toLocaleLowerCase().includes(q)
      ? group.outbounds.filter(id=>id.toLocaleLowerCase().includes(q) || nodes.some(n=>n.tag===id&&n.name.toLocaleLowerCase().includes(q)))
      : group.outbounds
    return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3" data-testid={'proxy-members-'+group.tag}>
      {items.map(id=>{
        const node=nodes.find(n=>n.tag===id)
        const selectedHere=group.type==='selector'&&selected[group.tag]===id
        const selectable=group.type==='selector'
        return <Button
          type="button" key={id}
          data-testid={'proxy-node-'+group.tag+'-'+id}
          disabled={!selectable}
          aria-pressed={selectable?selectedHere:undefined}
          variant={selectedHere?'secondary':'outline'}
          onClick={()=>{void selectNode(group.tag,id)}}
          className="h-auto min-h-[68px] min-w-0 justify-start gap-3 overflow-hidden rounded-lg px-3 py-3 text-left"
        >
          <span className="min-w-0 flex-1 space-y-1">
            <span className="block truncate text-sm font-medium">{node?.flag ? node.flag+' ' : ''}{node?.name||id}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {node ? node.protocol+' · '+latencyText(node.latency) : config.outbounds.some(g=>g.tag===id)?'嵌套策略组':'出站'}
            </span>
          </span>
          {selectedHere?<Check className="size-4 shrink-0"/>:null}
        </Button>
      })}
      {!items.length&&<p className="col-span-full px-2 py-4 text-sm text-muted-foreground">没有符合条件的候选节点</p>}
    </div>
  }
  const detail=(g:Group)=>(
    <div className="space-y-3">
      {g.type!=='selector'&&<p className="text-xs text-muted-foreground">
        {g.type==='urltest'?'自动测速组由内核选择出口，TCP 与 UDP 的结果可能不同。':'负载均衡按连接分配，没有全局固定选中节点。'}
      </p>}
      {members(g)}
    </div>
  )
  const header=(g:Group,inline:boolean)=>(
    <div className="flex min-w-0 items-center gap-2">
      {inline?<Button variant="ghost" type="button" className="h-auto min-h-16 min-w-0 flex-1 justify-start gap-3 px-1 py-2 text-left" aria-expanded={isExpanded(g.tag)} data-testid={'proxy-expand-'+g.tag} onClick={()=>toggle(g.tag)}>
        {isExpanded(g.tag)?<ChevronDown className="size-4 shrink-0"/>:<ChevronRight className="size-4 shrink-0"/>}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{g.tag}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{groupLabel[g.type]}{g.type==='selector'&&selected[g.tag]?' · '+getName(selected[g.tag]):''} · {g.outbounds.length} 个节点</span>
        </span>
      </Button>:<div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{g.tag}</p>
        <p className="truncate text-xs text-muted-foreground">{groupLabel[g.type]} · {g.outbounds.length} 个节点</p>
      </div>}
      <Button type="button" variant="ghost" size="icon" aria-label={'测试 '+g.tag+' 延迟'} onClick={()=>{void testGroup(g.tag)}}><Activity className="size-4"/></Button>
      {onEdit&&<Button type="button" variant="ghost" size="icon" aria-label={'编辑策略组 '+g.tag} onClick={()=>onEdit(g.tag)}><Pencil className="size-4"/></Button>}
    </div>
  )
  return <div className={'space-y-4 '+className} data-testid="proxy-groups-view">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-40 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
        <Input className="h-10 pl-9" aria-label="搜索策略组或节点" placeholder="搜索策略组或节点" value={query} onChange={e=>setQuery(e.target.value)}/>
      </div>
      <div className="inline-flex items-center rounded-lg border p-1" role="group" aria-label="代理显示方式">
        <Button type="button" size="sm" variant={proxyViewMode==='list'?'secondary':'ghost'} aria-pressed={proxyViewMode==='list'} onClick={()=>setProxyViewMode('list')}><List className="size-4"/>列表</Button>
        <Button type="button" size="sm" variant={proxyViewMode==='tab'?'secondary':'ghost'} aria-pressed={proxyViewMode==='tab'} onClick={()=>setProxyViewMode('tab')}><LayoutGrid className="size-4"/>标签</Button>
      </div>
    </div>

    {proxyViewMode==='list'?<div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground">{filtered.length} 个策略组</p>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={expandAll}>全部展开</Button>
          <Button type="button" variant="ghost" size="sm" onClick={collapseAll}>全部收起</Button>
        </div>
      </div>
      {filtered.map(g=><Card key={g.tag} className="gap-0 overflow-hidden p-0" data-testid={'proxy-group-'+g.tag}>
        <div className="px-3">{header(g,true)}</div>
        {isExpanded(g.tag)&&<CardContent className="border-t px-3 py-3">{detail(g)}</CardContent>}
      </Card>)}
    </div>:<div className="space-y-3">
      <Tabs value={activeTab} onValueChange={setTab} className="min-w-0">
        <TabsList className="flex h-auto max-w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted p-1" aria-label="代理策略组标签">
          {filtered.map(g=><TabsTrigger value={g.tag} key={g.tag} className="shrink-0" data-testid={'proxy-tab-'+g.tag}>{g.tag}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {filtered.filter(g=>g.tag===activeTab).map(g=><Card key={g.tag} className="gap-3 p-4" data-testid={'proxy-tab-panel-'+g.tag}>
        {header(g,false)}
        {detail(g)}
      </Card>)}
    </div>}
    {!filtered.length&&<div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">没有符合条件的策略组</div>}
  </div>
}
