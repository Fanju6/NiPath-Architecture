import * as React from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpFromLine, Blocks, Check, ChevronRight,
  CircleHelp, Clock3, Code2, ExternalLink, Gauge, Globe2, HardDrive, LayoutDashboard,
  ListFilter, Menu, Moon, Network, Pause, Play, Plus, RefreshCcw, Route, Search, Settings2,
  Shield, ShieldCheck, SlidersHorizontal, Sun, Trash2, Wifi, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar'
import { useUI, type Page } from '@/store/use-ui'
import { latencyText, recentConnections, type Group } from '@/lib/demo'

const navigation: { id: Page; name: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', name: '概览', icon: LayoutDashboard },
  { id: 'proxies', name: '代理', icon: Network },
  { id: 'resources', name: '资源', icon: Blocks },
  { id: 'rules', name: '规则', icon: Route },
  { id: 'settings', name: '设置', icon: Settings2 },
]
const labels: Record<Page,string> = { overview:'概览', proxies:'代理', resources:'资源', rules:'规则', settings:'设置' }
const groupNames: Record<Group['type'],string> = { selector:'手动选择', urltest:'自动测速', 'load-balance':'负载均衡' }

function PageHeading({title,description,children}: {title:string;description:string;children?:React.ReactNode}) {
  return <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-sm text-muted-foreground">{description}</p></div>
    {children}
  </div>
}
function DemoAlert({children}: {children?:React.ReactNode}) {
  return <Alert><CircleHelp /><AlertTitle>交互演示</AlertTitle><AlertDescription>{children || 'GitHub Pages 尚未连接 NiPath Core，所有网络状态和数据均为本地模拟。'}</AlertDescription></Alert>
}
function StatusBadge({ok,text}: {ok:boolean;text?:string}) {
  return <Badge variant={ok?'secondary':'outline'}>{ok?<Check className="size-3" />:<Pause className="size-3"/>}{text || (ok?'模拟运行中':'模拟已停止')}</Badge>
}
function Metric({title,value,subtitle,icon:Icon}: {title:string;value:string;subtitle:string;icon:typeof Activity}) {
  return <Card><CardHeader><CardDescription className="flex items-center justify-between">{title}<Icon className="size-4"/></CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{subtitle}</p></CardContent></Card>
}

function Overview() {
 const {demoRunning,setRunning,nodes,sources,config,setPage} = useUI()
 return <div className="space-y-6">
   <PageHeading title="概览" description="NiPath 运行状态、网络流量及资源概况。"><StatusBadge ok={demoRunning}/></PageHeading>
   <DemoAlert/>
   <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wifi className="size-5"/>代理服务</CardTitle><CardDescription>Android Root · TUN/eBPF · 示例设备</CardDescription><CardAction><StatusBadge ok={demoRunning} text={demoRunning?'Ready · 演示':'Stopped · 演示'}/></CardAction></CardHeader>
     <CardContent><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div className="space-y-2">
       <p className="text-3xl font-semibold tracking-tight">{demoRunning?'服务正在运行':'服务已停止'}</p>
       <p className="text-sm text-muted-foreground">这只是模拟的运行状态，不会接管真实网络。</p></div>
       <Button size="lg" variant={demoRunning?'outline':'default'} onClick={()=>setRunning(!demoRunning)}>{demoRunning?<Pause/>:<Play/>}{demoRunning?'停止代理（演示）':'启动代理（演示）'}</Button></div>
     </CardContent></Card>
   <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
     <Metric title="下载速度" value={demoRunning?'12.4 MB/s':'0 B/s'} subtitle="演示样本流量" icon={ArrowDownToLine}/>
     <Metric title="上传速度" value={demoRunning?'2.6 MB/s':'0 B/s'} subtitle="演示样本流量" icon={ArrowUpFromLine}/>
     <Metric title="活动连接" value={demoRunning?'132':'0'} subtitle="运行时尚未连接" icon={Activity}/>
     <Metric title="节点总量" value={String(nodes.length)} subtitle="当前演示节点" icon={Globe2}/>
   </div>
   <div className="grid gap-4 lg:grid-cols-3">
     <Card className="lg:col-span-2"><CardHeader><CardTitle>网络概览</CardTitle><CardDescription>近期传输情况 · 示例统计</CardDescription></CardHeader>
       <CardContent className="space-y-6"><div className="space-y-2"><div className="flex justify-between text-sm"><span>下载流量</span><span className="font-medium">1.42 GB</span></div><Progress value={68}/></div>
         <div className="space-y-2"><div className="flex justify-between text-sm"><span>上传流量</span><span className="font-medium">286 MB</span></div><Progress value={24}/></div>
         <Separator/><div className="flex flex-wrap justify-between gap-3 text-sm"><span className="text-muted-foreground">运行时间（演示）</span><span className="font-medium">{demoRunning?'02:18:36':'00:00:00'}</span></div></CardContent>
       <CardFooter><Button variant="outline" onClick={()=>setPage('proxies')}>查看策略组 <ArrowRight/></Button></CardFooter></Card>
     <Card><CardHeader><CardTitle>资源状态</CardTitle><CardDescription>订阅与策略组统计</CardDescription></CardHeader><CardContent className="space-y-4">
       {[['订阅来源',sources.length],['候选节点',nodes.length],['策略组',config.outbounds.length]].map(([k,v])=><div key={String(k)} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}
       <Separator/><Button className="w-full" variant="outline" onClick={()=>setPage('resources')}>管理资源 <ArrowRight/></Button></CardContent></Card>
   </div>
   <Card><CardHeader><CardTitle>最近连接</CardTitle><CardDescription>演示连接记录，不代表真实出站流量</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>目标</TableHead><TableHead>协议</TableHead><TableHead className="text-right">耗时</TableHead></TableRow></TableHeader>
     <TableBody>{recentConnections.map(c=><TableRow key={c.name}><TableCell className="font-medium">{c.icon} {c.name}</TableCell><TableCell className="text-muted-foreground">{c.type}</TableCell><TableCell className="text-right">{c.time}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
 </div>
}

function Proxies() {
 const {config,nodes,selectedGroup,selectGroup,selected,selectNode,addGroup,removeGroup,show,demoRunning}=useUI()
 const [search,setSearch]=React.useState('')
 const [nodeSearch,setNodeSearch]=React.useState('')
 const [creating,setCreating]=React.useState(false)
 const [name,setName]=React.useState('')
 const [type,setType]=React.useState<Group['type']>('selector')
 const [members,setMembers]=React.useState('')
 const group=config.outbounds.find(g=>g.tag===selectedGroup)||config.outbounds[0]
 const filtered=config.outbounds.filter(g=>g.tag.toLowerCase().includes(search.toLowerCase()))
 const candidates=(group?.outbounds||[]).filter(tag=>tag.toLowerCase().includes(nodeSearch.toLowerCase())||nodes.some(n=>n.tag===tag&&n.name.toLowerCase().includes(nodeSearch.toLowerCase())))
 const create=()=>{
  const tag=name.trim(), list=members.split(/[,，\n]/).map(x=>x.trim()).filter(Boolean)
  if(!tag||!list.length){show('请输入策略组名称与至少一个成员');return}
  if(config.outbounds.some(g=>g.tag===tag)){show('策略组名称已存在');return}
  addGroup({tag,type,outbounds:list});setCreating(false);setName('');setMembers('');setNodeSearch('')
 }
 return <div className="space-y-6">
   <PageHeading title="代理" description="策略组来自原生配置 JSON；按类型展示实际可操作能力。"><Button onClick={()=>setCreating(true)}><Plus/>新建策略组</Button></PageHeading>
   <DemoAlert>手动选择只更新本地演示数据，URLTest 和负载均衡不允许手动伪造当前出口。</DemoAlert>
   <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
     <Card><CardHeader><CardTitle>策略组 <Badge variant="secondary">{config.outbounds.length}</Badge></CardTitle><CardDescription>选择一个策略组查看其成员</CardDescription></CardHeader><CardContent className="space-y-3">
       <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" placeholder="搜索策略组" value={search} onChange={e=>setSearch(e.target.value)}/></div>
       <div className="space-y-1">{filtered.map(g=><Button key={g.tag} variant={group?.tag===g.tag?'secondary':'ghost'} className="w-full justify-between" onClick={()=>{selectGroup(g.tag);setNodeSearch('')}}>
         <span className="flex min-w-0 items-center gap-2"><Network className="size-4 shrink-0"/><span className="truncate">{g.tag}</span></span><ChevronRight className="size-4 shrink-0"/></Button>)}</div>
       {!filtered.length&&<p className="py-4 text-sm text-muted-foreground">没有符合条件的策略组</p>}
     </CardContent></Card>
     {group?<Card><CardHeader><div className="flex items-center gap-2"><CardTitle>{group.tag}</CardTitle><Badge variant="outline">{groupNames[group.type]}</Badge></div><CardDescription>{group.outbounds.length} 个显式引用 · 配置与运行态分别展示</CardDescription>
       <CardAction><Button size="icon" variant="outline" aria-label="测速" onClick={()=>show('演示：尚未连接 sing-box URLTest API')}><RefreshCcw/></Button></CardAction></CardHeader>
       <CardContent className="space-y-5">
         <Alert><Activity/><AlertTitle>{group.type==='selector'?'手动选择':group.type==='urltest'?'自动选择':'连接级调度'}</AlertTitle>
         <AlertDescription>{group.type==='selector'?('当前选择（演示）：'+(nodes.find(n=>n.tag===selected[group.tag])?.name||selected[group.tag]||'未选择')):group.type==='urltest'?'真实 TCP / UDP 最优出口可能不同；请以引擎状态为准。':'负载均衡并不存在全局选中的单一节点。'}</AlertDescription></Alert>
         <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" placeholder="筛选候选节点" value={nodeSearch} onChange={e=>setNodeSearch(e.target.value)}/></div>
         <div className="divide-y rounded-lg border">{candidates.map(tag=>{const node=nodes.find(n=>n.tag===tag);const sub=config.outbounds.find(g=>g.tag===tag);const active=group.type==='selector'&&selected[group.tag]===tag
         return <div key={tag} className="flex flex-wrap items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><div className="font-medium">{node?.flag} {node?.name||sub?.tag||tag}</div><div className="mt-1 text-xs text-muted-foreground">{node?.source|| (sub?'嵌套策略组':'内置 / 未解析')} · {node?.protocol||sub?.type||'出站'}</div></div>
          {node&&<Badge variant="outline">{latencyText(node.latency)}</Badge>}
          {group.type==='selector'?<Button size="sm" variant={active?'secondary':'outline'} onClick={()=>selectNode(group.tag,tag)}>{active?<Check/>:null}{active?'已选择':'选择'}</Button>:<Badge variant="secondary">自动</Badge>}
         </div>})}{!candidates.length&&<div className="px-4 py-8 text-center text-sm text-muted-foreground">暂无可用候选成员</div>}</div>
       </CardContent><CardFooter className="justify-between gap-2">
         <p className="text-xs text-muted-foreground">当前配置修订 · 演示</p>
         <Button variant="destructive" size="sm" onClick={()=>group.tag==='默认代理'?show('默认代理正在被引用，不允许在演示中删除'):removeGroup(group.tag)}><Trash2/>删除</Button>
       </CardFooter></Card>:<Card><CardContent>尚未创建策略组</CardContent></Card>}
   </div>
   <Dialog open={creating} onOpenChange={setCreating}><DialogContent><DialogHeader><DialogTitle>新建策略组</DialogTitle><DialogDescription>在同一份演示 JSON 中添加策略组。</DialogDescription></DialogHeader>
     <div className="space-y-4"><div className="space-y-2"><Label htmlFor="new-group-name">策略组名称</Label><Input id="new-group-name" value={name} onChange={e=>setName(e.target.value)} placeholder="例如：流媒体"/></div>
     <div className="space-y-2"><Label htmlFor="group-type">策略组类型</Label><NativeSelect id="group-type" value={type} onChange={e=>setType(e.target.value as Group['type'])}><option value="selector">Selector · 手动</option><option value="urltest">URLTest · 自动</option><option value="load-balance">LoadBalance · 负载均衡</option></NativeSelect></div>
     <div className="space-y-2"><Label htmlFor="group-members">成员 tag（换行或逗号分隔）</Label><Textarea id="group-members" value={members} onChange={e=>setMembers(e.target.value)} placeholder="sub-1/jp-tokyo-03"/></div></div>
     <DialogFooter><Button variant="outline" onClick={()=>setCreating(false)}>取消</Button><Button onClick={create}>创建演示组</Button></DialogFooter>
   </DialogContent></Dialog>
 </div>
}

function Resources() {
 const {sources,nodes,refreshSource,addSource,show}=useUI()
 const [open,setOpen]=React.useState(false)
 const [sourceName,setSourceName]=React.useState('')
 const [sourceUrl,setSourceUrl]=React.useState('')
 const [query,setQuery]=React.useState('')
 const [origin,setOrigin]=React.useState('all')
 const filtered=nodes.filter(n=>(origin==='all'||origin===n.source)&&([n.name,n.protocol,n.tag].join(' ').toLowerCase().includes(query.toLowerCase())))
 const add=()=>{if(!sourceName.trim()||!/^https?:\/\//.test(sourceUrl)){show('填写订阅名称和有效 HTTP(S) 地址');return}addSource(sourceName.trim(),sourceUrl);setOpen(false);setSourceName('');setSourceUrl('')}
 return <div className="space-y-6"><PageHeading title="资源" description="统一管理订阅来源、本地节点及全部节点。"><Button onClick={()=>setOpen(true)}><Plus/>添加订阅</Button></PageHeading>
   <DemoAlert>刷新操作只修改演示状态，无法下载真实订阅。资源下载成功不等于内核已经应用。</DemoAlert>
   <div className="grid gap-4 sm:grid-cols-3"><Metric title="订阅来源" value={String(sources.length)} subtitle="演示资源" icon={Globe2}/><Metric title="节点总量" value={String(nodes.length)} subtitle="示例 Catalog" icon={HardDrive}/><Metric title="有延迟数据" value={String(nodes.filter(n=>n.latency!==null).length)} subtitle="样本测试结果" icon={Zap}/></div>
   <Tabs defaultValue="subscriptions" className="space-y-4"><TabsList><TabsTrigger value="subscriptions">订阅</TabsTrigger><TabsTrigger value="local">本地节点</TabsTrigger><TabsTrigger value="all">全部节点</TabsTrigger></TabsList>
     <TabsContent value="subscriptions" className="space-y-4"><div className="grid gap-4 lg:grid-cols-2">{sources.map(s=><Card key={s.id}><CardHeader><CardTitle>{s.name}</CardTitle><CardDescription className="break-all">{s.url}</CardDescription><CardAction><Badge variant={s.status==='applied'?'secondary':'outline'}>{s.status==='applied'?'已生效（演示）':s.status==='failed'?'失败':'待确认'}</Badge></CardAction></CardHeader>
       <CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">节点数</span><strong>{s.count}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">订阅流量</span><strong>{s.traffic}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">更新时间</span><strong>{s.updated}</strong></div></CardContent>
       <CardFooter><Button variant="outline" onClick={()=>refreshSource(s.id)}><RefreshCcw/>刷新（演示）</Button></CardFooter></Card>)}</div></TabsContent>
     <TabsContent value="local"><Card><CardHeader><CardTitle>本地节点</CardTitle><CardDescription>手动添加或导入的节点</CardDescription></CardHeader><CardContent>
       {nodes.filter(n=>n.source==='本地节点').map(n=><div key={n.tag} className="flex items-center justify-between gap-3 border-b py-3"><span className="font-medium">{n.flag} {n.name}</span><Badge variant="outline">{n.protocol}</Badge></div>)}
       <Button className="mt-4" variant="outline" onClick={()=>show('演示：本地节点添加尚未连接 Core')}><Plus/>新建节点</Button></CardContent></Card></TabsContent>
     <TabsContent value="all"><Card><CardHeader><CardTitle>节点列表</CardTitle><CardDescription>可按来源与名称筛选</CardDescription></CardHeader><CardContent className="space-y-4">
       <div className="flex flex-wrap gap-2"><Input className="min-w-40 flex-1" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索节点"/><NativeSelect className="min-w-40" value={origin} onChange={e=>setOrigin(e.target.value)}><option value="all">全部来源</option>{Array.from(new Set(nodes.map(n=>n.source))).map(s=><option key={s}>{s}</option>)}</NativeSelect></div>
       <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>节点名称</TableHead><TableHead>协议</TableHead><TableHead>来源</TableHead><TableHead className="text-right">延迟</TableHead></TableRow></TableHeader><TableBody>{filtered.map(n=><TableRow key={n.tag}><TableCell className="font-medium">{n.flag} {n.name}</TableCell><TableCell>{n.protocol}</TableCell><TableCell>{n.source}</TableCell><TableCell className="text-right"><Badge variant="outline">{latencyText(n.latency)}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
     </CardContent></Card></TabsContent>
   </Tabs>
   <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>添加订阅</DialogTitle><DialogDescription>演示来源，不会实际访问订阅服务器。</DialogDescription></DialogHeader>
     <div className="space-y-4"><div className="space-y-2"><Label htmlFor="source-name">来源名称</Label><Input id="source-name" placeholder="我的订阅" value={sourceName} onChange={e=>setSourceName(e.target.value)}/></div>
     <div className="space-y-2"><Label htmlFor="source-url">订阅地址</Label><Input id="source-url" placeholder="https://example.com/sub" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)}/></div></div>
     <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>取消</Button><Button onClick={add}>添加（演示）</Button></DialogFooter>
   </DialogContent></Dialog>
 </div>
}

function Rules(){
 const {config,addRule,toggleRule,removeRule,show,setPage}=useUI()
 const [open,setOpen]=React.useState(false)
 const [match,setMatch]=React.useState('')
 const [outbound,setOutbound]=React.useState('默认代理')
 const [filter,setFilter]=React.useState('')
 const [test,setTest]=React.useState('api.openai.com')
 const save=()=>{if(!match.trim()){show('请输入匹配条件');return}addRule({id:'r'+Date.now(),match:match.trim(),outbound,enabled:true});setMatch('');setOpen(false)}
 const rules=config.route.rules.filter(x=>[x.match,x.outbound].join(' ').toLowerCase().includes(filter.toLowerCase()))
 return <div className="space-y-6"><PageHeading title="规则" description="路由规则及 DNS 规则均属于同一份原生配置。"><Button onClick={()=>setOpen(true)}><Plus/>新建规则</Button></PageHeading>
   <DemoAlert>本页面仅操作演示规则，不能替代 sing-box 的真实匹配和引用校验。</DemoAlert>
   <Tabs defaultValue="route" className="space-y-4"><TabsList><TabsTrigger value="route">路由规则</TabsTrigger><TabsTrigger value="dns">DNS 规则</TabsTrigger><TabsTrigger value="test">匹配测试</TabsTrigger></TabsList>
     <TabsContent value="route"><Card><CardHeader><CardTitle>路由规则 <Badge variant="secondary">{config.route.rules.length}</Badge></CardTitle><CardDescription>规则按配置顺序匹配</CardDescription></CardHeader>
     <CardContent className="space-y-4"><Input placeholder="筛选规则或出站" value={filter} onChange={e=>setFilter(e.target.value)}/><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>匹配条件</TableHead><TableHead>目标出站</TableHead><TableHead>启用</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
       <TableBody>{rules.map(r=><TableRow key={r.id}><TableCell className="font-medium">{r.match}</TableCell><TableCell><Badge variant="outline">{r.outbound}</Badge></TableCell>
       <TableCell><Switch checked={r.enabled} onCheckedChange={()=>toggleRule(r.id)} aria-label={r.enabled?'停用规则':'启用规则'}/></TableCell><TableCell className="text-right"><Button size="icon" variant="ghost" aria-label="删除规则" onClick={()=>removeRule(r.id)}><Trash2/></Button></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card></TabsContent>
     <TabsContent value="dns"><Card><CardHeader><CardTitle>DNS 规则</CardTitle><CardDescription>保持与 sing-box 原生 JSON 的单一来源原则</CardDescription></CardHeader><CardContent className="space-y-4">
       <p className="text-sm text-muted-foreground">目前演示配置尚无 DNS 规则。接入 Go Core 后在此显示解析服务器、FakeIP 与规则列表。</p>
       <Button variant="outline" onClick={()=>setPage('settings')}><Code2/>查看原生 JSON</Button></CardContent></Card></TabsContent>
     <TabsContent value="test"><Card><CardHeader><CardTitle>匹配测试</CardTitle><CardDescription>仅做 UI 流程演示</CardDescription></CardHeader><CardContent className="space-y-4">
       <Label htmlFor="test-domain">测试域名</Label><Input id="test-domain" value={test} onChange={e=>setTest(e.target.value)}/>
       <Button onClick={()=>show('演示匹配：未连接 sing-box 的真实数据面')}>测试规则</Button><Alert><CircleHelp/><AlertTitle>测试预览</AlertTitle><AlertDescription>域名：{test} · 引擎未连接，无法确定真实出口。</AlertDescription></Alert>
       </CardContent></Card></TabsContent>
   </Tabs>
   <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>新增路由规则</DialogTitle><DialogDescription>新增到演示配置，尚未进行内核校验。</DialogDescription></DialogHeader>
     <div className="space-y-4"><div className="space-y-2"><Label htmlFor="rule-match">匹配表达式</Label><Input id="rule-match" value={match} onChange={e=>setMatch(e.target.value)} placeholder="domain_suffix: example.com"/></div>
     <div className="space-y-2"><Label htmlFor="rule-outbound">目标出站</Label><NativeSelect id="rule-outbound" value={outbound} onChange={e=>setOutbound(e.target.value)}><option value="direct">direct</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}</NativeSelect></div></div>
     <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>取消</Button><Button onClick={save}>添加规则</Button></DialogFooter>
   </DialogContent></Dialog>
 </div>
}

function Settings(){
 const {theme,setTheme,config,revision,setRawConfig,show,demoRunning}=useUI()
 const [raw,setRaw]=React.useState(()=>JSON.stringify(config,null,2))
 const [error,setError]=React.useState('')
 const save=()=>{const r=setRawConfig(raw);setError(r.ok?'':r.error||'配置无效');if(r.ok)show('演示 JSON 修改已保存；未应用到真实内核')}
 const pretty=()=>{try{setRaw(JSON.stringify(JSON.parse(raw),null,2));setError('')}catch{setError('JSON 语法错误')}}
 const exportJson=()=>{const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='nipath-demo.json';a.click();URL.revokeObjectURL(url)}
 return <div className="space-y-6"><PageHeading title="设置" description="内核、DNS、配置、安全和个性化选项。"><Badge variant="outline">Revision {revision}</Badge></PageHeading>
   <DemoAlert>这里展示的是本地交互演示；原生配置编辑尚未执行 sing-box Schema 校验。</DemoAlert>
   <Tabs defaultValue="general" className="space-y-4"><TabsList className="h-auto flex-wrap justify-start"><TabsTrigger value="general">通用</TabsTrigger><TabsTrigger value="engine">内核</TabsTrigger><TabsTrigger value="dns">DNS</TabsTrigger><TabsTrigger value="config">原生配置</TabsTrigger><TabsTrigger value="security">安全</TabsTrigger><TabsTrigger value="appearance">外观</TabsTrigger></TabsList>
     <TabsContent value="general"><Card><CardHeader><CardTitle>通用设置</CardTitle><CardDescription>NiPath 基础信息</CardDescription></CardHeader><CardContent className="space-y-5">
       <div className="flex justify-between gap-4"><span className="text-sm">运行平台（演示）</span><Badge variant="outline">Android Root</Badge></div><Separator/>
       <div className="flex justify-between gap-4"><span className="text-sm">当前配置修订</span><Badge variant="secondary">{revision}</Badge></div><Separator/><p className="text-sm text-muted-foreground">未来支持 Windows、Linux 与 Android 的统一管理界面。</p>
     </CardContent></Card></TabsContent>
     <TabsContent value="engine"><Card><CardHeader><CardTitle>内核与接管</CardTitle><CardDescription>由平台宿主和 Go Core 提供实际能力</CardDescription></CardHeader><CardContent className="space-y-5">
       <div className="flex justify-between gap-4"><span className="text-sm">sing-box 状态</span><StatusBadge ok={demoRunning}/></div><Separator/>
       <div className="flex justify-between gap-4"><span className="text-sm">网络接管</span><Badge variant="outline">TUN / eBPF（示例）</Badge></div><Separator/>
       <Button variant="outline" onClick={()=>show('真实诊断需要 Core API')}><Activity/>查看诊断（演示）</Button>
     </CardContent></Card></TabsContent>
     <TabsContent value="dns"><Card><CardHeader><CardTitle>DNS 设置</CardTitle><CardDescription>直接映射唯一原生 JSON</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">DNS 服务器及规则将从实际 sing-box 配置解析。不会维护另一份 DNS 设置。</p></CardContent></Card></TabsContent>
     <TabsContent value="config"><Card><CardHeader><CardTitle>原生 sing-box JSON</CardTitle><CardDescription>共享配置事实源 · 当前演示 Revision {revision}</CardDescription></CardHeader><CardContent className="space-y-4">
       <Alert><CircleHelp/><AlertTitle>仅支持演示 Schema</AlertTitle><AlertDescription>未知字段、注释保留及原生校验需 Core 接入，当前编辑不会应用到代理。</AlertDescription></Alert>
       <Textarea className="min-h-[360px] font-mono text-xs leading-6" spellCheck={false} value={raw} onChange={e=>setRaw(e.target.value)}/>
       {error&&<p className="text-sm text-destructive">{error}</p>}
       <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={pretty}>格式化</Button><Button variant="outline" onClick={exportJson}>导出 JSON</Button><Button onClick={save}>保存演示配置</Button></div>
     </CardContent></Card></TabsContent>
     <TabsContent value="security"><Card><CardHeader><CardTitle>安全与访问</CardTitle><CardDescription>Core 鉴权与本地权限边界</CardDescription></CardHeader><CardContent className="space-y-4">
       <div className="flex items-center justify-between"><span className="text-sm">WebUI 鉴权</span><Badge variant="outline">尚未连接</Badge></div><Separator/><p className="text-sm text-muted-foreground">GitHub Pages 不连接 Root / Shell。正式版仅经可信 NiPath Core API 执行高权限操作。</p>
     </CardContent></Card></TabsContent>
     <TabsContent value="appearance"><Card><CardHeader><CardTitle>外观</CardTitle><CardDescription>官方 shadcn/ui Neutral 默认主题，无自定义调色板</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-4">
       <div className="space-y-1"><Label htmlFor="dark-mode">深色模式</Label><p className="text-sm text-muted-foreground">使用官方暗色主题变量</p></div>
       <Switch id="dark-mode" checked={theme==='dark'} onCheckedChange={v=>setTheme(v?'dark':'light')}/>
     </CardContent></Card></TabsContent>
   </Tabs>
 </div>
}

function AppSidebar(){
 const {page,setPage,demoRunning}=useUI()
 const {isMobile,setOpenMobile}=useSidebar()
 return <Sidebar collapsible="icon">
   <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" onClick={()=>{setPage('overview');if(isMobile)setOpenMobile(false)}}>
     <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Network className="size-4"/></div>
     <div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">NiPath</span><span className="truncate text-xs">奶屁 · 1.0</span></div>
   </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
   <SidebarContent><SidebarGroup><SidebarGroupLabel>工作区</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navigation.map(({id,name,icon:Icon})=><SidebarMenuItem key={id}>
     <SidebarMenuButton isActive={page===id} tooltip={name} onClick={()=>{setPage(id);if(isMobile)setOpenMobile(false)}}><Icon/><span>{name}</span></SidebarMenuButton>
   </SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>
   <SidebarGroup className="mt-auto"><SidebarGroupLabel>项目</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem>
     <SidebarMenuButton asChild tooltip="GitHub"><a href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer"><ExternalLink/><span>架构仓库</span></a></SidebarMenuButton>
   </SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup>
   </SidebarContent><SidebarFooter><div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground"><span className="size-2 rounded-full bg-sidebar-primary"/><span className="group-data-[collapsible=icon]:hidden">{demoRunning?'代理运行中（演示）':'代理已停止（演示）'}</span></div></SidebarFooter><SidebarRail/>
 </Sidebar>
}

function AppContent(){
 const {page,theme,setTheme,notice,clearNotice}=useUI()
 React.useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark')},[theme])
 return <SidebarInset>
   <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4"><SidebarTrigger className="-ml-1"/><Separator orientation="vertical" className="mr-2 h-4"/>
     <div className="flex min-w-0 flex-1 items-center gap-2 text-sm"><span className="hidden text-muted-foreground sm:block">NiPath</span><span className="hidden text-muted-foreground sm:block">/</span><span className="truncate font-medium">{labels[page]}</span></div>
     <Badge variant="outline" className="hidden sm:inline-flex">DEMO</Badge><Button variant="ghost" size="icon" aria-label="切换主题" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun/>:<Moon/>}</Button>
     <Button variant="ghost" size="icon" aria-label="GitHub" asChild><a href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer"><ExternalLink/></a></Button>
   </header>
   <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
     {page==='overview'&&<Overview/>}{page==='proxies'&&<Proxies/>}{page==='resources'&&<Resources/>}{page==='rules'&&<Rules/>}{page==='settings'&&<Settings/>}
   </main>
   {notice&&<div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-md border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg" role="status"><span>{notice}</span><Button size="sm" variant="ghost" onClick={clearNotice}>关闭</Button></div>}
 </SidebarInset>
}
export default function App(){return <SidebarProvider><AppSidebar/><AppContent/></SidebarProvider>}
