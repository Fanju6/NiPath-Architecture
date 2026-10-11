import * as React from 'react'
import AndroidApp from './mobile/AndroidApp'
import { ProxyGroupsView } from './components/proxy-groups-view'
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpFromLine, Blocks, Check,
  CircleHelp, Code2, ExternalLink, Globe2, HardDrive, LayoutDashboard,
  Moon, Network, Pause, Play, Plus, RefreshCcw, Route, Settings2,
  Sun, Trash2, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
import { latencyText, type Group } from '@/lib/model'

const navigation: { id: Page; name: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', name: '概览', icon: LayoutDashboard },
  { id: 'proxies', name: '代理', icon: Network },
  { id: 'resources', name: '资源', icon: Blocks },
  { id: 'rules', name: '规则', icon: Route },
  { id: 'settings', name: '设置', icon: Settings2 },
]
const labels: Record<Page,string> = { overview:'概览', proxies:'代理', resources:'资源', rules:'规则', settings:'设置' }

function PageHeading({title,description,children}: {title:string;description:string;children?:React.ReactNode}) {
  return <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-sm text-muted-foreground">{description}</p></div>
    {children}
  </div>
}
function DemoNote() {
  return <Alert><CircleHelp/><AlertTitle>演示模式</AlertTitle><AlertDescription>公开预览未接入 NiPath Go Core。配置编辑暂存在当前浏览器会话中；设备控制、订阅同步与测速须连接 Core。</AlertDescription></Alert>
}
function StatusBadge({ok,connected=true}: {ok:boolean;connected?:boolean}) {
  return <Badge variant={ok?'secondary':'outline'}>{ok?<Check className="size-3"/>:<Pause className="size-3"/>}{!connected?'Core 未连接':ok?'运行中':'已停止'}</Badge>
}
function Metric({title,value,subtitle,icon:Icon}: {title:string;value:string;subtitle:string;icon:typeof Activity}) {
 return <Card><CardHeader><CardDescription className="flex items-center justify-between">{title}<Icon className="size-4"/></CardDescription><CardTitle className="text-2xl tabular-nums">{value}</CardTitle></CardHeader>
   <CardContent><p className="text-xs text-muted-foreground">{subtitle}</p></CardContent></Card>
}
function Overview(){
 const {demoRunning,coreConnected,mockMode,setRunning,checkCore,busy,nodes,sources,config,setPage,downloadRate,uploadRate,activeConnections}=useUI()
 return <div className="space-y-6"><PageHeading title="概览" description="代理状态、实时传输和资源信息。"><StatusBadge ok={demoRunning} connected={coreConnected||mockMode}/></PageHeading>
  <Card><CardHeader><CardTitle>代理服务</CardTitle><CardDescription>NiPath Core · 网络接管状态</CardDescription><CardAction><StatusBadge ok={demoRunning} connected={coreConnected||mockMode}/></CardAction></CardHeader>
  <CardContent className="flex flex-wrap items-center justify-between gap-4"><p className="text-xl font-semibold">{!coreConnected&&!mockMode?'等待 Core 连接':demoRunning?'服务正在运行':'服务已停止'}</p>
   <div className="flex gap-2"><Button variant="outline" onClick={()=>{void checkCore()}}><RefreshCcw/>刷新状态</Button>
   <Button disabled={(!coreConnected&&!mockMode)||busy} onClick={()=>{void setRunning(!demoRunning)}}>{demoRunning?<Pause/>:<Play/>}{demoRunning?'停止代理':'启动代理'}</Button></div>
  </CardContent></Card>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   <Metric title="下载速度" value={coreConnected||mockMode?(downloadRate/1048576).toFixed(2)+' MB/s':'—'} subtitle="实时运行数据" icon={ArrowDownToLine}/>
   <Metric title="上传速度" value={coreConnected||mockMode?(uploadRate/1048576).toFixed(2)+' MB/s':'—'} subtitle="实时运行数据" icon={ArrowUpFromLine}/>
   <Metric title="活动连接" value={activeConnections===null?'—':String(activeConnections)} subtitle="设备连接数" icon={Activity}/>
   <Metric title="节点总量" value={String(nodes.length)} subtitle="当前工作区" icon={Globe2}/>
  </div>
  <Card><CardHeader><CardTitle>资源状态</CardTitle><CardDescription>订阅、策略组和节点管理</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
   {([['订阅来源',sources.length],['节点',nodes.length],['策略组',config.outbounds.length]] as const).map(([key,value])=><div key={key} className="flex justify-between rounded-md border p-3"><span className="text-sm text-muted-foreground">{key}</span><strong>{value}</strong></div>)}
  </CardContent><CardFooter><Button variant="outline" onClick={()=>setPage('resources')}>管理资源<ArrowRight/></Button></CardFooter></Card>
  <DemoNote/>
 </div>
}

function Proxies(){
 const {config,addGroup,updateGroup,removeGroup,show}=useUI()
 const [dialog,setDialog]=React.useState<'new'|'edit'|null>(null)
 const [target,setTarget]=React.useState('')
 const [name,setName]=React.useState('')
 const [type,setType]=React.useState<Group['type']>('selector')
 const [members,setMembers]=React.useState('')
 const beginEdit=(tag:string)=>{
   const group=config.outbounds.find(x=>x.tag===tag)
   if(!group)return
   setTarget(tag);setName(group.tag);setType(group.type);setMembers(group.outbounds.join('\n'));setDialog('edit')
 }
 const save=()=>{
   const tag=name.trim(),outbounds=members.split(/[,，\n]/).map(x=>x.trim()).filter(Boolean)
   if(!tag||!outbounds.length){show('请输入策略组名称与候选成员');return}
   const value={tag,type,outbounds}
   if(dialog==='edit'){const original=config.outbounds.find(x=>x.tag===target);if(original)updateGroup(target,{...original,...value})}
   else addGroup(value)
   setDialog(null)
 }
 return <div className="space-y-6">
   <PageHeading title="代理" description="直接展开策略组并切换节点；列表和标签布局可自由切换。">
     <Button onClick={()=>{setName('');setMembers('');setType('selector');setDialog('new')}}><Plus/>新建策略组</Button>
   </PageHeading>
   <ProxyGroupsView onEdit={beginEdit}/>
   <Dialog open={dialog!==null} onOpenChange={open=>{if(!open)setDialog(null)}}>
     <DialogContent><DialogHeader><DialogTitle>{dialog==='new'?'新建策略组':'编辑策略组'}</DialogTitle>
       <DialogDescription>更改工作区配置草稿；节点选择无需打开此窗口。</DialogDescription></DialogHeader>
       <div className="space-y-4">
         <label className="block space-y-2 text-sm">组名<Input value={name} onChange={e=>setName(e.target.value)}/></label>
         <label className="block space-y-2 text-sm">组类型<NativeSelect value={type} onChange={e=>setType(e.target.value as Group['type'])}>
           <option value="selector">手动选择</option><option value="urltest">自动测速</option><option value="load-balance">负载均衡</option>
         </NativeSelect></label>
         <label className="block space-y-2 text-sm">候选成员 Tag（逗号或换行分隔）<Textarea value={members} onChange={e=>setMembers(e.target.value)}/></label>
       </div>
       <DialogFooter className="gap-2">
         {dialog==='edit'&&<Button variant="destructive" className="sm:mr-auto" onClick={()=>{removeGroup(target);setDialog(null)}}><Trash2/>删除策略组</Button>}
         <Button variant="outline" onClick={()=>setDialog(null)}>取消</Button><Button onClick={save}>保存</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
 </div>
}

function Resources(){
 const {sources,nodes,addSource,updateSource,removeSource,refreshSource,addNode,updateNode,removeNode,show}=useUI()
 const [dialog,setDialog]=React.useState<'source'|'node'|null>(null)
 const [editId,setEditId]=React.useState<string|null>(null)
 const [editNodeTag,setEditNodeTag]=React.useState<string|null>(null)
 const [name,setName]=React.useState('')
 const [url,setUrl]=React.useState('')
 const [protocol,setProtocol]=React.useState('Shadowsocks')
 const [tag,setTag]=React.useState('')
 const [query,setQuery]=React.useState('')
 const save=()=>{
   if(!name.trim()){show('请输入名称');return}
   if(dialog==='source'){
     if(!(url.startsWith('http://')||url.startsWith('https://'))){show('请输入合法的 HTTP(S) 订阅地址');return}
     if(editId)updateSource(editId,name.trim(),url);else addSource(name.trim(),url)
   }else if(dialog==='node'){
     if(!tag.trim()||!url.trim()){show('请输入节点 tag 与地址');return}
     const value={tag:tag.trim(),name:name.trim(),address:url.trim(),source:'本地节点',protocol,flag:'',latency:null}
     if(editNodeTag)updateNode(editNodeTag,value);else addNode(value)
   }
   setDialog(null)
 }
 const beginSource=(id?:string)=>{
   const value=sources.find(x=>x.id===id);setName(value?.name||'');setUrl(value?.url||'');setEditId(id||null);setDialog('source')
 }
 const beginNode=(tagToEdit?:string)=>{
    const node=nodes.find(x=>x.tag===tagToEdit)
    setEditId(null);setEditNodeTag(tagToEdit||null)
    setName(node?.name||'');setUrl(node?.address||'')
    setTag(node?.tag||'local/'+crypto.randomUUID().slice(0,8))
    setProtocol(node?.protocol||'Shadowsocks');setDialog('node')
 }
 const filtered=nodes.filter(n=>[n.tag,n.name,n.protocol,n.source].join(' ').toLowerCase().includes(query.toLowerCase()))
 return <div className="space-y-6"><PageHeading title="资源" description="订阅来源、本地节点和资源目录。"><Button onClick={()=>beginSource()}><Plus/>添加订阅</Button></PageHeading>
  <div className="grid gap-4 sm:grid-cols-3"><Metric title="订阅" value={String(sources.length)} subtitle="工作区来源" icon={Globe2}/><Metric title="节点" value={String(nodes.length)} subtitle="节点资料" icon={HardDrive}/><Metric title="已测速" value={String(nodes.filter(n=>n.latency!==null).length)} subtitle="可用的测速记录" icon={Zap}/></div>
  <Tabs defaultValue="sources" className="space-y-4"><TabsList><TabsTrigger value="sources">订阅</TabsTrigger><TabsTrigger value="nodes">节点</TabsTrigger></TabsList>
  <TabsContent value="sources"><Card><CardHeader><CardTitle>订阅来源</CardTitle></CardHeader><CardContent className="space-y-3">
   {sources.map(x=><div key={x.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3"><div className="min-w-0 flex-1"><p className="font-medium">{x.name}</p><p className="break-all text-xs text-muted-foreground">{x.url}</p></div>
     <Badge variant="outline">{x.status==='applied'?'已生效':x.status==='failed'?'同步失败':'待同步'}</Badge>
     <Button variant="outline" size="sm" onClick={()=>{void refreshSource(x.id)}}><RefreshCcw/>刷新</Button>
     <Button variant="ghost" size="sm" onClick={()=>beginSource(x.id)}>编辑</Button>
     <Button variant="ghost" size="icon" aria-label={'删除'+x.name} onClick={()=>removeSource(x.id)}><Trash2/></Button>
   </div>)}{!sources.length&&<p className="p-6 text-sm text-muted-foreground">还没有订阅来源，点击“添加订阅”开始。</p>}
  </CardContent></Card></TabsContent>
  <TabsContent value="nodes"><Card><CardHeader><CardTitle>节点资料</CardTitle><CardAction><Button variant="outline" size="sm" onClick={()=>beginNode()}><Plus/>添加节点</Button></CardAction></CardHeader><CardContent className="space-y-4">
    <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索节点"/>
    <Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>协议</TableHead><TableHead>来源</TableHead><TableHead>延迟</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
     <TableBody>{filtered.map(n=><TableRow key={n.tag}><TableCell>{n.name}</TableCell><TableCell>{n.protocol}</TableCell><TableCell>{n.source}</TableCell><TableCell>{latencyText(n.latency)}</TableCell>
      <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={()=>beginNode(n.tag)} aria-label={'编辑节点'+n.name}>编辑</Button>
        <Button variant="ghost" size="icon" aria-label={'删除节点'+n.name} onClick={()=>removeNode(n.tag)}><Trash2/></Button></div></TableCell></TableRow>)}</TableBody></Table>
    {!filtered.length&&<p className="py-4 text-sm text-muted-foreground">暂无节点</p>}
  </CardContent></Card></TabsContent></Tabs>
  <Dialog open={dialog!==null} onOpenChange={open=>{if(!open)setDialog(null)}}><DialogContent><DialogHeader><DialogTitle>{dialog==='source'?'订阅来源':editNodeTag?'编辑节点':'添加本地节点'}</DialogTitle><DialogDescription>保存到工作区</DialogDescription></DialogHeader>
   <div className="space-y-3"><label className="block space-y-2 text-sm">名称<Input value={name} onChange={e=>setName(e.target.value)}/></label>
    {dialog==='node'&&<><label className="block space-y-2 text-sm">Tag<Input value={tag} disabled={!!editNodeTag} onChange={e=>setTag(e.target.value)}/></label><label className="block space-y-2 text-sm">协议<NativeSelect value={protocol} onChange={e=>setProtocol(e.target.value)}>{['Shadowsocks','VLESS','VMess','Trojan','Hysteria2','TUIC','AnyTLS'].map(x=><option key={x}>{x}</option>)}</NativeSelect></label></>}
    <label className="block space-y-2 text-sm">{dialog==='source'?'订阅 URL':'服务器地址'}<Input value={url} onChange={e=>setUrl(e.target.value)}/></label>
   </div><DialogFooter><Button variant="outline" onClick={()=>setDialog(null)}>取消</Button><Button onClick={save}>保存</Button></DialogFooter>
  </DialogContent></Dialog>
 </div>
}

function Rules(){
 const {config,addRule,updateRule,toggleRule,removeRule,moveRule,show,setPage}=useUI()
 const [dialog,setDialog]=React.useState<string|null>(null)
 const [match,setMatch]=React.useState('')
 const [outbound,setOutbound]=React.useState('direct')
 const [filter,setFilter]=React.useState('')
 const begin=(id?:string)=>{const r=config.route.rules.find(x=>x.id===id);setMatch(r?.match||'');setOutbound(r?.outbound||'direct');setDialog(id||'new')}
 const save=()=>{if(!match.trim()||!outbound){show('填写规则匹配条件和出站');return}
  if(dialog&&dialog!=='new'){const rule=config.route.rules.find(r=>r.id===dialog);if(rule)updateRule(rule.id,{...rule,match:match.trim(),outbound})}
  else addRule({id:crypto.randomUUID(),match:match.trim(),outbound,enabled:true});setDialog(null)
 }
 const filtered=config.route.rules.filter(r=>[r.match,r.outbound].join(' ').toLowerCase().includes(filter.toLowerCase()))
 return <div className="space-y-6"><PageHeading title="规则" description="管理路由顺序、规则状态和目标出站。"><Button onClick={()=>begin()}><Plus/>新建规则</Button></PageHeading>
  <Tabs defaultValue="route" className="space-y-4"><TabsList><TabsTrigger value="route">路由规则</TabsTrigger><TabsTrigger value="dns">DNS</TabsTrigger></TabsList>
   <TabsContent value="route"><Card><CardHeader><CardTitle>路由规则 <Badge variant="secondary">{config.route.rules.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-4">
    <Input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="搜索规则"/>
    <Table><TableHeader><TableRow><TableHead>匹配条件</TableHead><TableHead>目标出站</TableHead><TableHead>启用</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{filtered.map(r=><TableRow key={r.id}>
     <TableCell>{r.match}</TableCell><TableCell>{r.outbound}</TableCell><TableCell><Switch checked={r.enabled} onCheckedChange={()=>toggleRule(r.id)}/></TableCell>
     <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={()=>moveRule(r.id,-1)}>↑</Button><Button variant="ghost" size="sm" onClick={()=>moveRule(r.id,1)}>↓</Button>
      <Button variant="ghost" size="sm" onClick={()=>begin(r.id)}>编辑</Button><Button variant="ghost" size="icon" aria-label={'删除规则'+r.match} onClick={()=>removeRule(r.id)}><Trash2/></Button>
     </div></TableCell></TableRow>)}</TableBody></Table>
    {!filtered.length&&<p className="p-4 text-sm text-muted-foreground">暂无规则</p>}
   </CardContent></Card></TabsContent>
   <TabsContent value="dns"><Card><CardHeader><CardTitle>DNS 配置</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">DNS 位于同一份原生 JSON 中。</p><Button variant="outline" onClick={()=>setPage('settings')}><Code2/>打开配置编辑器</Button></CardContent></Card></TabsContent>
  </Tabs>
  <Dialog open={dialog!==null} onOpenChange={open=>{if(!open)setDialog(null)}}><DialogContent><DialogHeader><DialogTitle>{dialog==='new'?'新增规则':'编辑规则'}</DialogTitle></DialogHeader>
   <div className="space-y-3"><label className="block space-y-2 text-sm">匹配条件<Input value={match} onChange={e=>setMatch(e.target.value)}/></label>
    <label className="block space-y-2 text-sm">目标出站<NativeSelect value={outbound} onChange={e=>setOutbound(e.target.value)}><option value="direct">direct</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}</NativeSelect></label>
   </div><DialogFooter><Button variant="outline" onClick={()=>setDialog(null)}>取消</Button><Button onClick={save}>保存</Button></DialogFooter>
  </DialogContent></Dialog>
 </div>
}

function Settings(){
 const {theme,setTheme,config,revision,setRawConfig,coreConnected,demoRunning,checkCore,loadCoreConfig,applyConfig,busy,show}=useUI()
 const [raw,setRaw]=React.useState(()=>JSON.stringify(config,null,2))
 const [error,setError]=React.useState('')
 const fileRef=React.useRef<HTMLInputElement>(null)
 const save=()=>{const r=setRawConfig(raw);setError(r.ok?'':r.error||'无效 JSON');if(r.ok)show('配置草稿已保存')}
 const pretty=()=>{try{setRaw(JSON.stringify(JSON.parse(raw),null,2));setError('')}catch(e){setError(e instanceof Error?e.message:'JSON 解析失败')}}
 const exportJson=()=>{const u=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='nipath-config.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(u),1000)}
 const importJson=async(file?:File)=>{if(!file)return;if(file.size>5*1024*1024){setError('配置文件超过 5 MB');return}
   try{const text=await file.text();JSON.parse(text);setRaw(text);setError('')}catch(e){setError(e instanceof Error?e.message:'导入失败')}}
 return <div className="space-y-6"><PageHeading title="设置" description="Core 状态、配置管理和外观。"><Badge variant="outline">本地修订 {revision}</Badge></PageHeading>
  <Tabs defaultValue="config" className="space-y-4"><TabsList className="h-auto flex-wrap"><TabsTrigger value="config">配置</TabsTrigger><TabsTrigger value="engine">内核</TabsTrigger><TabsTrigger value="dns">DNS</TabsTrigger><TabsTrigger value="security">安全</TabsTrigger><TabsTrigger value="appearance">外观</TabsTrigger><TabsTrigger value="about">关于</TabsTrigger></TabsList>
   <TabsContent value="config"><Card><CardHeader><CardTitle>原生 JSON 编辑器</CardTitle><CardDescription>工作区草稿 · 应用需由设备 Core 校验和保存</CardDescription></CardHeader><CardContent className="space-y-4">
    <Textarea className="min-h-[360px] font-mono text-xs leading-relaxed" value={raw} onChange={e=>setRaw(e.target.value)} spellCheck={false}/>
    {error&&<p className="text-sm text-destructive">{error}</p>}
    <input ref={fileRef} className="hidden" type="file" accept=".json,application/json" onChange={e=>{void importJson(e.target.files?.[0]);e.target.value=''}}/>
    <div className="flex flex-wrap justify-end gap-2">
     <Button variant="outline" onClick={()=>fileRef.current?.click()}>导入 JSON</Button><Button variant="outline" onClick={exportJson}>导出 JSON</Button>
     <Button variant="outline" onClick={pretty}>格式化</Button><Button variant="secondary" onClick={save}>保存草稿</Button>
     <Button variant="outline" disabled={!coreConnected||busy} onClick={()=>{void loadCoreConfig()}}>读取 Core 配置</Button>
     <Button disabled={!coreConnected||busy} onClick={()=>{void applyConfig()}}>校验并应用</Button>
    </div>
   </CardContent></Card></TabsContent>
   <TabsContent value="engine"><Card><CardHeader><CardTitle>Core 与运行状态</CardTitle></CardHeader><CardContent className="space-y-4">
    <div className="flex justify-between"><span className="text-sm">Core 连接</span><Badge variant="outline">{coreConnected?'已连接':'未连接'}</Badge></div><Separator/>
    <div className="flex justify-between"><span className="text-sm">代理服务</span><StatusBadge ok={demoRunning} connected={coreConnected}/></div>
    <Button variant="outline" onClick={()=>{void checkCore()}}><RefreshCcw/>刷新连接</Button>
   </CardContent></Card></TabsContent>
   <TabsContent value="dns"><Card><CardHeader><CardTitle>DNS 配置</CardTitle><CardDescription>通过唯一 JSON 配置进行修改</CardDescription></CardHeader>
    <CardContent className="space-y-3"><p className="text-sm">当前定义了 {Array.isArray(config.dns?.servers)?config.dns.servers.length:0} 个 DNS 服务器。</p>
     <pre className="max-h-52 overflow-auto rounded-md border bg-muted p-3 text-xs">{JSON.stringify(config.dns||{servers:[]},null,2)}</pre>
     <p className="text-xs text-muted-foreground">请在配置编辑器中编辑 dns 字段并保存。</p>
    </CardContent></Card></TabsContent>
   <TabsContent value="security"><Card><CardHeader><CardTitle>安全与访问</CardTitle></CardHeader><CardContent className="space-y-2">
     <p className="text-sm">API 连接：{coreConnected?'已连接':'未连接'}</p>
     <p className="text-sm text-muted-foreground">使用可信的同源 NiPath Core API；管理页面不具备任意 Shell 执行权限。</p>
   </CardContent></Card></TabsContent>
   <TabsContent value="appearance"><Card><CardHeader><CardTitle>外观</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><Label htmlFor="desktop-theme">深色模式</Label><Switch id="desktop-theme" checked={theme==='dark'} onCheckedChange={v=>setTheme(v?'dark':'light')}/></CardContent></Card></TabsContent>
   <TabsContent value="about"><Card><CardHeader><CardTitle>关于 NiPath</CardTitle><CardDescription>NiPath · 多平台代理管理系统</CardDescription></CardHeader>
     <CardContent className="space-y-3"><p className="text-sm">产品目标版本：1.0.0</p><p className="text-sm">客户端：React WebUI</p>
       <Button asChild variant="outline"><a href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer"><ExternalLink/>GitHub 仓库</a></Button>
     </CardContent></Card></TabsContent>
  </Tabs>
 </div>
}
function AppSidebar(){
 const {page,setPage,coreConnected,mockMode,demoRunning}=useUI()
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
   </SidebarContent><SidebarFooter><div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground"><span className="size-2 rounded-full bg-sidebar-primary"/><span className="group-data-[collapsible=icon]:hidden">{!coreConnected&&!mockMode?'Core 未连接':demoRunning?'代理运行中':'代理已停止'}</span></div></SidebarFooter><SidebarRail/>
 </Sidebar>
}

function AppContent(){
 const {page,theme,setTheme,notice,clearNotice}=useUI()
 React.useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark')},[theme])
 return <SidebarInset>
   <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4"><SidebarTrigger className="-ml-1"/><Separator orientation="vertical" className="mr-2 h-4"/>
     <div className="flex min-w-0 flex-1 items-center gap-2 text-sm"><span className="hidden text-muted-foreground sm:block">NiPath</span><span className="hidden text-muted-foreground sm:block">/</span><span className="truncate font-medium">{labels[page]}</span></div>
<Button variant="ghost" size="icon" aria-label="切换主题" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun/>:<Moon/>}</Button>
     <Button variant="ghost" size="icon" aria-label="GitHub" asChild><a href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer"><ExternalLink/></a></Button>
   </header>
   <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
     {page==='overview'&&<Overview/>}{page==='proxies'&&<Proxies/>}{page==='resources'&&<Resources/>}{page==='rules'&&<Rules/>}{page==='settings'&&<Settings/>}
   </main>
   {notice&&<div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-md border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg" role="status"><span>{notice}</span><Button size="sm" variant="ghost" onClick={clearNotice}>关闭</Button></div>}
 </SidebarInset>
}
// Android-native interaction patterns with the same shadcn/ui visual components as desktop.
const compactQuery = '(max-width: 839px)'
// Real Android tablets should keep Android app navigation (rail), not switch
// to the desktop WebUI just because their viewport is wide.
const getCompact = () => window.matchMedia(compactQuery).matches || /\bAndroid\b/i.test(navigator.userAgent)
const listenCompact = (notify: () => void) => {
  const query = window.matchMedia(compactQuery)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}
function ThemeSync() {
  const theme = useUI(s => s.theme)
  const checkCore = useUI(s => s.checkCore)
  React.useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark') }, [theme])
  React.useEffect(() => {
    void checkCore()
    const handle = window.setInterval(() => { void checkCore() }, 15_000)
    return () => window.clearInterval(handle)
  }, [checkCore])
  return null
}
export default function App(){
 const compact = React.useSyncExternalStore(listenCompact,getCompact,()=>false)
 return <><ThemeSync/>{compact?<AndroidApp/>:<SidebarProvider><AppSidebar/><AppContent/></SidebarProvider>}</>
}
