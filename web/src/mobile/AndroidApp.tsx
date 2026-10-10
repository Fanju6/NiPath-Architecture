import * as React from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine,
  Check, CheckCheck, ChevronRight, CircleHelp, Code2, Globe2, HardDrive,
  Home, Layers3, Moon, Network, Pause, Play, Plus, RefreshCw,
  Route, Search, Settings2, ShieldCheck, SlidersHorizontal, Sun, Trash2, Wifi, X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { useUI, type Page } from '@/store/use-ui'
import { latencyText, type Group } from '@/lib/demo'

/**
 * Android-compact presentation, separate from the desktop shadcn dashboard.
 * The data and commands are intentionally the SAME Zustand demo state.
 * shadcn/ui New York components and Neutral visual design; native Android-style interaction/navigation.
 */
const destinations: { id:Page; title:string; icon:typeof Home; selectedIcon:typeof Home }[] = [
  { id:'overview', title:'概览', icon:Home, selectedIcon:Home },
  { id:'proxies', title:'代理', icon:Network, selectedIcon:Network },
  { id:'resources', title:'资源', icon:Layers3, selectedIcon:Layers3 },
  { id:'rules', title:'规则', icon:Route, selectedIcon:Route },
  { id:'settings', title:'设置', icon:Settings2, selectedIcon:Settings2 },
]
type Detail = {type:'group'; tag:string}|{type:'json'}|{type:'about'}
type AddKind = 'group'|'source'|'rule'|null
function IconButton({label,children,onClick}: {label:string;children:React.ReactNode;onClick:()=>void}) {
 return <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0 rounded-full" aria-label={label} onClick={onClick}>{children}</Button>
}
function Section({title,children}: {title:string;children:React.ReactNode}) {
 return <section className="space-y-3"><h2 className="px-1 text-sm font-semibold text-muted-foreground">{title}</h2><Card className="gap-0 divide-y overflow-hidden py-0">{children}</Card></section>
}
function Row({icon,iconClassName='',title,subtitle,trailing,onClick,disabled}: {
 icon:React.ReactNode;iconClassName?:string;title:string;subtitle?:string;trailing?:React.ReactNode;onClick?:()=>void;disabled?:boolean
}) {
 const content=<><span className={'grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground '+iconClassName}>{icon}</span>
  <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="break-words text-sm font-medium text-foreground">{title}</span>
  {subtitle&&<span className="break-words text-xs text-muted-foreground">{subtitle}</span>}</span>
  {trailing??(onClick?<ChevronRight size={18} className="shrink-0 text-muted-foreground"/>:null)}</>
 return onClick?<Button type="button" variant="ghost" className="h-auto min-h-16 w-full justify-start gap-3 rounded-none px-4 py-3 text-left font-normal hover:bg-accent" onClick={onClick} disabled={disabled}>{content}</Button>:
 <div className="flex min-h-16 w-full items-center gap-3 px-4 py-3">{content}</div>
}
function DemoNote() {
 return <Alert className="mt-auto"><CircleHelp/><AlertTitle>演示模式</AlertTitle>
 <AlertDescription>此公开预览页面没有接入运行中的 NiPath Core。编辑内容保留为会话草稿，代理启动、节点测速和订阅同步需要设备 Core 服务。</AlertDescription></Alert>
}
function OverviewScreen({navigate}: {navigate:(page:Page)=>void}) {
 const {demoRunning,setRunning,nodes,sources,config,coreConnected,busy,downloadRate,uploadRate,activeConnections}=useUI()
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-28 pt-5">
   <Card className="gap-4 bg-card py-5">
     <div className="flex items-center justify-between gap-3 px-5"><span className="grid size-12 place-items-center rounded-lg bg-secondary text-secondary-foreground"><ShieldCheck size={30} strokeWidth={1.8}/></span><Badge variant="secondary">{coreConnected?(demoRunning?'已连接':'已停止'):'Core 未连接'}</Badge></div>
     <div className="space-y-1 px-5"><h2 className="text-xl font-semibold">{coreConnected?(demoRunning?'代理正在运行':'代理未运行'):'等待连接 Core'}</h2><p className="text-sm text-muted-foreground">服务状态与网络接管</p></div>
     <Button type="button" size="lg" className="mx-5" disabled={!coreConnected||busy} onClick={()=>{void setRunning(!demoRunning)}}>{demoRunning?<Pause size={19}/>:<Play size={19}/>} {demoRunning?'停止代理':'启动代理'}</Button>
   </Card>
   <div className="grid grid-cols-2 gap-3">
     <Card className="gap-2 p-4"><span className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowDownToLine size={16}/> 下载</span><strong className="text-2xl tabular-nums">{coreConnected?(downloadRate/1048576).toFixed(2):'—'} <small className="text-xs font-normal">MB/s</small></strong><span className="text-xs text-muted-foreground">实时速度</span></Card>
     <Card className="gap-2 p-4"><span className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowUpFromLine size={16}/> 上传</span><strong className="text-2xl tabular-nums">{coreConnected?(uploadRate/1048576).toFixed(2):'—'} <small className="text-xs font-normal">MB/s</small></strong><span className="text-xs text-muted-foreground">实时速度</span></Card>
   </div>
   <Section title="运行状态"><Row icon={<Activity size={21}/>} title="活跃连接" subtitle={coreConnected?'当前运行时连接':'等待 Core 连接'} trailing={<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">{activeConnections??'—'}</span>}/>
   <Row icon={<Network size={21}/>} title="策略组" subtitle="JSON 配置定义" trailing={<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">{config.outbounds.length}</span>}/></Section>
   <Section title="常用操作">
     <Row icon={<Globe2 size={21}/>} title="代理策略" subtitle="切换节点，查看测速" onClick={()=>navigate('proxies')}/>
     <Row icon={<HardDrive size={21}/>} title="订阅资源" subtitle={sources.length+' 个订阅 · '+nodes.length+' 个节点'} onClick={()=>navigate('resources')}/>
   </Section>
   <DemoNote/>
 </div>
}
function ProxiesScreen({openGroup}: {openGroup:(tag:string)=>void}) {
 const {config,selected,nodes}=useUI()
 const [search,setSearch]=React.useState('')
 const groups=config.outbounds.filter(g=>g.tag.toLowerCase().includes(search.toLowerCase()))
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-28 pt-5">
   <div className="relative"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="h-11 pl-10" aria-label="搜索策略组" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索策略组"/></div>
   <Section title={'策略组 · '+config.outbounds.length}>
    {groups.map(g=>{
     const current=nodes.find(n=>n.tag===selected[g.tag])?.name||selected[g.tag]
     const secondary=g.type==='selector'?('手动选择 · '+(current||'未选择')):g.type==='urltest'?'自动测速 · 根据延迟选择':'负载均衡 · 按连接调度'
     return <Row key={g.tag} icon={g.type==='selector'?<Network size={21}/>:g.type==='urltest'?<Activity size={21}/>:<Layers3 size={21}/>}
       title={g.tag} subtitle={secondary} onClick={()=>openGroup(g.tag)} />
    })}
    {!groups.length&&<div className="p-6 text-center text-sm text-muted-foreground">没有匹配的策略组</div>}
   </Section>
 </div>
}
function GroupDetail({tag}: {tag:string}) {
 const {config,nodes,selected,selectNode,show,removeGroup,testGroup,updateGroup}=useUI()
 const g=config.outbounds.find(x=>x.tag===tag)
 const [search,setSearch]=React.useState('')
 const [edit,setEdit]=React.useState(false)
 const [name,setName]=React.useState(g?.tag||tag)
 const [membersText,setMembersText]=React.useState((g?.outbounds||[]).join('\n'))
 if(!g)return <div className="p-6 text-center text-sm text-muted-foreground">策略组不存在</div>
 const isManual=g.type==='selector'
 const members=g.outbounds.filter(id=>id.toLowerCase().includes(search.toLowerCase())||nodes.some(n=>n.tag===id&&n.name.toLowerCase().includes(search.toLowerCase())))
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-8 pt-5">
   <div className="flex items-center gap-3 px-1 py-2"><span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><Network size={23}/></span><p className="text-sm text-muted-foreground">{isManual?'手动选择':g.type==='urltest'?'自动测速':'负载均衡'} · {g.outbounds.length} 个候选</p></div>
   <Card className="gap-2 p-4"><span className="text-xs text-muted-foreground">{isManual?'当前选中':g.type==='urltest'?'测速策略':'连接分配策略'}</span><strong className="text-base font-semibold">{isManual?(nodes.find(n=>n.tag===selected[g.tag])?.name||selected[g.tag]||'暂无选择'):g.type==='urltest'?'自动选择最佳出口':g.strategy||'按连接调度'}</strong></Card>
   <div className="relative"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="h-11 pl-10" aria-label="搜索成员" placeholder="搜索候选节点" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <Section title="候选节点">
    {members.map(id=>{const node=nodes.find(n=>n.tag===id),chosen=isManual&&selected[g.tag]===id;return <Row key={id} icon={<Globe2 size={21}/>} title={node?node.flag+' '+node.name:id}
      subtitle={(node?.source||'其他出站')+' · '+(node?latencyText(node.latency):'嵌套策略组')}
      trailing={isManual?(chosen?<span className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground"><Check size={18}/></span>:<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">选择</span>):<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">自动</span>}
      onClick={()=>{if(isManual)void selectNode(g.tag,id);else show('该策略组由内核自动选择节点')}}/>})}
    {!members.length&&<div className="p-6 text-center text-sm text-muted-foreground">暂无候选成员</div>}
   </Section>
   <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>{void testGroup(g.tag)}}><RefreshCw size={18}/>测试延迟</Button>
    <Button variant="outline" onClick={()=>{setName(g.tag);setMembersText(g.outbounds.join('\n'));setEdit(true)}}>编辑策略组</Button></div>
   <Sheet open={edit} onOpenChange={setEdit}><SheetContent side="bottom" className="gap-4 rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))]">
     <SheetHeader><SheetTitle>编辑策略组</SheetTitle><SheetDescription>修改名称及候选节点，保存为配置草稿</SheetDescription></SheetHeader>
     <label className="space-y-2 text-sm">名称<Input value={name} onChange={e=>setName(e.target.value)}/></label>
     <label className="space-y-2 text-sm">候选节点（每行一个 tag）<Textarea value={membersText} onChange={e=>setMembersText(e.target.value)}/></label>
     <Button onClick={()=>{const members=membersText.split(/[,，\n]/).map(x=>x.trim()).filter(Boolean);if(!name.trim()||!members.length){show('请填写名称及成员');return}
       updateGroup(g.tag,{...g,tag:name.trim(),outbounds:members});setEdit(false)}}>保存策略组</Button>
   </SheetContent></Sheet>
   {g.tag!=='默认代理'&&<Button variant="destructive" size="sm" onClick={()=>removeGroup(g.tag)}><Trash2 size={17}/> 删除策略组</Button>}
 </div>
}
function ResourcesScreen() {
 const {sources,nodes,refreshSource,addNode,updateNode,removeNode,updateSource,removeSource,show}=useUI()
 const [tab,setTab]=React.useState<'sources'|'nodes'>('sources')
 const [editSource,setEditSource]=React.useState<string|null>(null)
 const [editNode,setEditNode]=React.useState<string|null>(null)
 const [draftName,setDraftName]=React.useState('')
 const [draftUrl,setDraftUrl]=React.useState('')
 const [draftProtocol,setDraftProtocol]=React.useState('Shadowsocks')
 const [draftAddress,setDraftAddress]=React.useState('')
 const [draftTag,setDraftTag]=React.useState('')
 const startSource=(id:string)=>{const src=sources.find(x=>x.id===id);if(!src)return;setEditSource(id);setDraftName(src.name);setDraftUrl(src.url)}
 const startNode=(tag:string)=>{const node=nodes.find(x=>x.tag===tag);setEditNode(tag);setDraftTag(tag);setDraftName(node?.name||'');setDraftAddress(node?.address||'');setDraftProtocol(node?.protocol||'Shadowsocks')}
 const saveSource=()=>{if(!editSource||!draftName.trim()||!(draftUrl.startsWith('https://')||draftUrl.startsWith('http://'))){show('请输入来源名称和合法的 HTTP(S) 地址');return}updateSource(editSource,draftName.trim(),draftUrl);setEditSource(null)}
 const saveNode=()=>{if(!draftTag.trim()||!draftName.trim()||!draftAddress.trim()){show('请填写节点 tag、名称及服务器地址');return}
   const node={tag:draftTag.trim(),name:draftName.trim(),source:'本地节点',protocol:draftProtocol,latency:null,flag:'',address:draftAddress.trim()}
   if(editNode&&editNode!=='new')updateNode(editNode,node);else addNode(node);setEditNode(null)}

 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-28 pt-5">
   <Tabs value={tab} onValueChange={v=>setTab(v as 'sources'|'nodes')}><TabsList className="grid h-11 w-full grid-cols-2"><TabsTrigger value="sources">订阅 · {sources.length}</TabsTrigger><TabsTrigger value="nodes">节点 · {nodes.length}</TabsTrigger></TabsList></Tabs>
   {tab==='sources'?<Section title="订阅列表">
    {sources.map(s=><div className="space-y-3 px-4 py-4" key={s.id}>
      <div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Globe2 size={21}/></div><button className="flex min-w-0 flex-1 flex-col gap-1 text-left" onClick={()=>startSource(s.id)} aria-label={'编辑'+s.name}><strong className="break-words text-sm font-medium text-foreground">{s.name}</strong><span className="break-words text-xs text-muted-foreground">{s.count} 个节点 · {s.traffic}</span></button><Button variant="ghost" size="icon" aria-label={'刷新'+s.name} onClick={()=>{void refreshSource(s.id)}}><RefreshCw size={18}/></Button></div>
      <div className="flex flex-wrap items-center justify-between gap-2 pl-12 text-xs text-muted-foreground"><span>{s.updated}</span><Badge variant="outline">{s.status==='applied'?'已生效':s.status==='failed'?'更新失败':'待同步'}</Badge></div>
    </div>)}
    </Section>:<Section title="节点列表">
    {nodes.map(n=><Row key={n.tag} icon={<Wifi size={21}/>} title={n.flag+' '+n.name} subtitle={n.source+' · '+n.protocol} trailing={<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">{latencyText(n.latency)}</span>} onClick={()=>startNode(n.tag)}/>)}
    {!nodes.length&&<p className="p-6 text-center text-sm text-muted-foreground">还没有节点</p>}
    <div className="p-3"><Button className="w-full" variant="outline" onClick={()=>{setDraftTag('local/'+crypto.randomUUID().slice(0,8));setDraftName('');setDraftAddress('');setDraftProtocol('Shadowsocks');setEditNode('new')}}><Plus/>添加本地节点</Button></div>
   </Section>}
   {!sources.length&&tab==='sources'&&<p className="text-center text-sm text-muted-foreground">尚未添加订阅，可通过顶部添加按钮创建。</p>}
   <Sheet open={editSource!==null} onOpenChange={open=>{if(!open)setEditSource(null)}}><SheetContent side="bottom" className="gap-4 rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))]">
     <SheetHeader><SheetTitle>编辑订阅来源</SheetTitle><SheetDescription>修改来源名称或订阅地址</SheetDescription></SheetHeader>
     <div className="space-y-3"><label className="block space-y-2 text-sm">名称<Input value={draftName} onChange={e=>setDraftName(e.target.value)}/></label>
       <label className="block space-y-2 text-sm">URL<Input value={draftUrl} onChange={e=>setDraftUrl(e.target.value)}/></label>
       <Button className="w-full" onClick={saveSource}>保存</Button>
       <Button variant="destructive" className="w-full" onClick={()=>{if(editSource)removeSource(editSource);setEditSource(null)}}>删除来源</Button>
     </div></SheetContent></Sheet>
   <Sheet open={editNode!==null} onOpenChange={open=>{if(!open)setEditNode(null)}}><SheetContent side="bottom" className="gap-4 rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))]">
     <SheetHeader><SheetTitle>{editNode==='new'?'添加本地节点':'编辑节点资料'}</SheetTitle><SheetDescription>节点运行配置与认证信息需由 Core 校验</SheetDescription></SheetHeader>
     <div className="space-y-3"><label className="block space-y-2 text-sm">Tag<Input value={draftTag} onChange={e=>setDraftTag(e.target.value)} disabled={editNode!=='new'}/></label>
     <label className="block space-y-2 text-sm">名称<Input value={draftName} onChange={e=>setDraftName(e.target.value)}/></label>
     <label className="block space-y-2 text-sm">地址<Input value={draftAddress} onChange={e=>setDraftAddress(e.target.value)}/></label>
     <label className="block space-y-2 text-sm">协议<NativeSelect value={draftProtocol} onChange={e=>setDraftProtocol(e.target.value)}>
       {['Shadowsocks','VLESS','VMess','Trojan','Hysteria2','TUIC','AnyTLS'].map(x=><option key={x}>{x}</option>)}
     </NativeSelect></label>
     <Button className="w-full" onClick={saveNode}>保存节点资料</Button>
     {editNode!=='new'&&<Button variant="destructive" className="w-full" onClick={()=>{if(editNode)removeNode(editNode);setEditNode(null)}}>删除节点</Button>}
     </div></SheetContent></Sheet>
 </div>
}
function RulesScreen() {
 const {config,toggleRule,show,updateRule,removeRule,moveRule}=useUI()
 const [tab,setTab]=React.useState<'route'|'dns'>('route')
 const [editId,setEditId]=React.useState<string|null>(null)
 const [match,setMatch]=React.useState('')
 const [outbound,setOutbound]=React.useState('')
 const editRule=(id:string)=>{const rule=config.route.rules.find(x=>x.id===id);if(rule){setEditId(id);setMatch(rule.match);setOutbound(rule.outbound)}}
 const saveRule=()=>{const rule=config.route.rules.find(x=>x.id===editId);if(!rule||!match.trim()||!outbound){show('规则匹配条件和目标出站不能为空');return}
   updateRule(rule.id,{...rule,match:match.trim(),outbound});setEditId(null)}

 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-28 pt-5">
   <Tabs value={tab} onValueChange={v=>setTab(v as 'route'|'dns')}><TabsList className="grid h-11 w-full grid-cols-2"><TabsTrigger value="route">路由规则</TabsTrigger><TabsTrigger value="dns">DNS 规则</TabsTrigger></TabsList></Tabs>
   {tab==='route'?<Section title={'路由 · '+config.route.rules.length}>{config.route.rules.map(r=><div className="flex min-h-16 items-center gap-3 px-4 py-4" key={r.id}>
     <button className="flex min-w-0 flex-1 flex-col gap-1 text-left" onClick={()=>editRule(r.id)} aria-label={'编辑规则 '+r.match}>
       <span className="break-words text-sm font-medium text-foreground">{r.match}</span>
       <span className="break-words text-xs text-muted-foreground">目标：{r.outbound}</span></button>
     <Switch checked={r.enabled} onCheckedChange={()=>toggleRule(r.id)} aria-label={r.enabled?'停用规则':'启用规则'}/></div>)}
     {!config.route.rules.length&&<p className="p-6 text-center text-sm text-muted-foreground">暂无路由规则，点击右上角添加。</p>}
     </Section>:
    <Section title="DNS"><Row icon={<Layers3 size={21}/>} title="DNS 规则" subtitle="通过原生配置编辑 DNS 规则" onClick={()=>show('请到设置 > 原生配置编辑 DNS')}/></Section>}
   <Sheet open={editId!==null} onOpenChange={open=>{if(!open)setEditId(null)}}><SheetContent side="bottom" className="gap-4 rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))]">
     <SheetHeader><SheetTitle>编辑路由规则</SheetTitle><SheetDescription>按列表顺序匹配</SheetDescription></SheetHeader>
     <label className="space-y-2 text-sm">匹配条件<Input value={match} onChange={e=>setMatch(e.target.value)}/></label>
     <label className="space-y-2 text-sm">目标出站<NativeSelect value={outbound} onChange={e=>setOutbound(e.target.value)}>
       <option value="direct">direct</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}
     </NativeSelect></label>
     <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>{if(editId)moveRule(editId,-1)}}>上移</Button>
       <Button variant="outline" onClick={()=>{if(editId)moveRule(editId,1)}}>下移</Button></div>
     <Button onClick={saveRule}>保存规则</Button>
     <Button variant="destructive" onClick={()=>{if(editId)removeRule(editId);setEditId(null)}}>删除规则</Button>
   </SheetContent></Sheet>
 </div>
}
function SettingsScreen({openJson,openAbout}: {openJson:()=>void;openAbout:()=>void}) {
 const {theme,setTheme,revision,show,coreConnected,loadCoreConfig}=useUI()
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-28 pt-5">
   <Section title="个性化"><Row icon={theme==='dark'?<Moon size={21}/>:<Sun size={21}/>} title="深色主题" subtitle="跟随 NiPath 当前显示设置"
     trailing={<Switch checked={theme==='dark'} onCheckedChange={v=>setTheme(v?'dark':'light')} aria-label="深色主题"/>}/></Section>
   <Section title="内核与配置">
    <Row icon={<Wifi size={21}/>} title="网络接管" subtitle={coreConnected?'Core 已连接':'Core 未连接'} onClick={()=>{void loadCoreConfig()}}/>
    <Row icon={<Code2 size={21}/>} title="原生配置" subtitle={'本地配置草稿 · 修订 '+revision} onClick={openJson}/>
    <Row icon={<SlidersHorizontal size={21}/>} title="DNS 与规则" subtitle="从同一份原生配置读取" onClick={openJson}/>
   </Section>
   <Section title="更多"><Row icon={<ShieldCheck size={21}/>} title="安全与访问" subtitle={coreConnected?'连接已建立':'Core 尚未连接'} onClick={()=>show(coreConnected?'当前使用同源 Core 接口':'需要由 NiPath Core 提供已认证的同源 API')}/>
     <Row icon={<CircleHelp size={21}/>} title="关于 NiPath" subtitle="NiPath 1.0 · WebUI" onClick={openAbout}/>
   </Section>
 </div>
}
function JsonScreen(){
 const {config,setRawConfig,revision,show,applyConfig,loadCoreConfig,busy,coreConnected}=useUI()
 const [raw,setRaw]=React.useState(()=>JSON.stringify(config,null,2))
 const [error,setError]=React.useState('')
 const fileInput=React.useRef<HTMLInputElement>(null)
 function save(){const r=setRawConfig(raw);setError(r.ok?'':r.error||'配置无效');if(r.ok)show('配置草稿已保存')}
 const exportDraft=()=>{
   const url=URL.createObjectURL(new Blob([raw],{type:'application/json;charset=utf-8'}))
   const link=document.createElement('a');link.href=url;link.download='nipath-config.json';link.click()
   window.setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 const importFile=async(file?:File)=>{
   if(!file)return
   if(file.size>5*1024*1024){setError('配置文件超过 5 MB');return}
   try{const contents=await file.text();JSON.parse(contents);setRaw(contents);setError('');show('JSON 文件已导入编辑器，请检查后保存')}
   catch(e){setError(e instanceof Error?e.message:'文件无效')}
 }
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-8 pt-5">
   <p className="px-1 text-sm text-muted-foreground">草稿修订 {revision} · 修改后可导入或导出</p>
   <Textarea className="min-h-[55dvh] font-mono text-xs leading-6" value={raw} onChange={e=>setRaw(e.target.value)} spellCheck={false} aria-label="原生 JSON 配置"/>
   {error&&<p className="text-sm text-destructive" role="alert">{error}</p>}
   <input ref={fileInput} className="hidden" type="file" accept=".json,application/json" aria-label="导入 JSON" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value=''}}/>
   <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>fileInput.current?.click()}>导入 JSON</Button><Button variant="outline" onClick={exportDraft}>导出 JSON</Button></div>
   <Button size="lg" onClick={save}><CheckCheck size={18}/> 保存配置草稿</Button>
   <div className="grid grid-cols-2 gap-2">
     <Button variant="outline" disabled={!coreConnected||busy} onClick={()=>{void loadCoreConfig()}}>读取设备配置</Button>
     <Button disabled={!coreConnected||busy} onClick={()=>{void applyConfig()}}>校验并应用</Button>
   </div>
   {!coreConnected&&<p className="text-sm text-muted-foreground">Core 未连接，设备配置的校验与应用暂不可用。</p>}
 </div>
}
function AboutScreen(){
 return <div className="relative flex min-h-full flex-col gap-5 px-4 pb-8 pt-5"><div className="mx-auto mt-7 grid size-16 place-items-center rounded-xl bg-muted"><Network size={35}/></div><h1 className="text-center text-3xl font-semibold">NiPath</h1><p className="text-center text-sm text-muted-foreground">奶屁 · NP</p>
 <Section title="应用信息"><Row icon={<ShieldCheck size={21}/>} title="产品目标版本" trailing={<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">1.0.0</span>}/>
 <Row icon={<Code2 size={21}/>} title="当前客户端" trailing={<span className="shrink-0 max-w-[35%] text-right text-xs text-muted-foreground">React WebUI</span>}/></Section>
 <Button asChild variant="outline"><a href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer">GitHub 架构仓库 <ArrowRight size={18}/></a></Button>
 </div>
}
function AddSheet({kind,onOpenChange}: {kind:AddKind;onOpenChange:(open:boolean)=>void}) {
 const {addGroup,addSource,addRule,config,show}=useUI()
 const [name,setName]=React.useState('')
 const [url,setUrl]=React.useState('')
 const [members,setMembers]=React.useState('')
 const [groupType,setGroupType]=React.useState<Group['type']>('selector')
 const [outbound,setOutbound]=React.useState('默认代理')
 const close=()=>{onOpenChange(false);setName('');setUrl('');setMembers('')}
 const submit=()=>{
  if(kind==='group'){
   const list=members.split(/[,，\n]/).map(s=>s.trim()).filter(Boolean)
   if(!name.trim()||!list.length){show('请输入组名和候选成员');return}
   if(config.outbounds.some(g=>g.tag===name.trim())){show('策略组名称已存在');return}
   addGroup({tag:name.trim(),type:groupType,outbounds:list})
  }else if(kind==='source'){
   if(!name.trim()||!/^https?:\/\//.test(url)){show('请输入订阅名称及 HTTP(S) 地址');return}
   addSource(name.trim(),url)
  }else if(kind==='rule'){
   if(!name.trim()){show('请输入匹配条件');return}
   addRule({id:'r'+Date.now(),match:name.trim(),outbound,enabled:true})
  }
  close()
 }
 return <Sheet open={kind!==null} onOpenChange={o=>{if(!o)close()}}>
    <SheetContent side="bottom" className="max-h-[90dvh] gap-4 overflow-y-auto rounded-t-xl pb-[calc(16px+env(safe-area-inset-bottom))]" showCloseButton={false}>
      <SheetHeader><SheetTitle>{kind==='group'?'新建策略组':kind==='source'?'添加订阅':'新增路由规则'}</SheetTitle><SheetDescription>编辑工作区配置。应用到设备时由 NiPath Core 完成校验。</SheetDescription></SheetHeader>
      <div className="space-y-4 px-1">
       <label className="flex flex-col gap-2 text-sm font-medium">{kind==='rule'?'匹配条件':kind==='source'?'订阅名称':'策略组名称'}<Input value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='rule'?'domain_suffix: example.com':kind==='source'?'我的订阅':'媒体代理'}/></label>
       {kind==='source'&&<label className="flex flex-col gap-2 text-sm font-medium">订阅 URL<Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/sub"/></label>}
       {kind==='group'&&<><label className="flex flex-col gap-2 text-sm font-medium">组类型<NativeSelect value={groupType} onChange={e=>setGroupType(e.target.value as Group['type'])}><option value="selector">手动选择</option><option value="urltest">自动测速</option><option value="load-balance">负载均衡</option></NativeSelect></label><label className="flex flex-col gap-2 text-sm font-medium">候选成员 tag<Textarea value={members} onChange={e=>setMembers(e.target.value)} placeholder="输入一个或多个成员，用换行分隔"/></label></>}
       {kind==='rule'&&<label className="flex flex-col gap-2 text-sm font-medium">目标出站<NativeSelect value={outbound} onChange={e=>setOutbound(e.target.value)}><option value="direct">direct</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}</NativeSelect></label>}
       <div className="grid grid-cols-2 gap-3 pt-1"><Button type="button" variant="outline" size="lg" onClick={close}>取消</Button><Button type="button" size="lg" onClick={submit}>确认添加</Button></div>
      </div>
    </SheetContent>
   </Sheet>
}
export default function AndroidApp(){
 const {page,setPage,notice,clearNotice,theme}=useUI()
 const [detail,setDetail]=React.useState<Detail|null>(null)
 const [sheet,setSheet]=React.useState<AddKind>(null)
 const scrollRef=React.useRef<HTMLElement>(null)
 const active=destinations.find(x=>x.id===page)!
 React.useEffect(()=>{
   // Browser history also provides a sensible Android system Back fallback in WebView.
   const onPop=()=>setDetail(null)
   window.addEventListener('popstate',onPop)
   return ()=>window.removeEventListener('popstate',onPop)
 },[])
 const openDetail=(next:Detail)=>{
   window.history.pushState({nipathDetail:true},'', '#'+(next.type==='group'?'group-'+encodeURIComponent(next.tag):next.type))
   setDetail(next)
 }
 const back=()=>{
   if(window.history.state?.nipathDetail)window.history.back()
   else setDetail(null)
 }
 const navigate=(id:Page)=>{setDetail(null);setPage(id);if(scrollRef.current)scrollRef.current.scrollTop=0}
 const title=detail?(detail.type==='group'?detail.tag:detail.type==='json'?'原生配置':'关于 NiPath'):active.title
 return <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-background text-foreground" data-testid="android-shell" data-mobile-theme={theme}>
   <header className="shrink-0 border-b bg-background pt-[env(safe-area-inset-top)]" data-testid="mobile-app-bar">
     {detail ? (
       <div className="flex h-14 items-center gap-2 px-3">
         <IconButton label="返回" onClick={back}><ArrowLeft size={24}/></IconButton>
         <span className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight" data-testid="mobile-detail-title">{title}</span>
       </div>
     ) : (
       <div className="flex h-14 items-center gap-2 px-4">
         <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight" data-testid="mobile-page-title">{active.title}</h1>
         {page==='proxies'&&<IconButton label="添加策略组" onClick={()=>setSheet('group')}><Plus size={22}/></IconButton>}
         {page==='resources'&&<IconButton label="添加订阅" onClick={()=>setSheet('source')}><Plus size={22}/></IconButton>}
         {page==='rules'&&<IconButton label="新增路由规则" onClick={()=>setSheet('rule')}><Plus size={22}/></IconButton>}
       </div>
     )}
   </header>
   <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain" ref={scrollRef} key={detail?detail.type==='group'?detail.tag:detail.type:page}>
     {detail?.type==='group'?<GroupDetail tag={detail.tag}/>:
      detail?.type==='json'?<JsonScreen/>:
      detail?.type==='about'?<AboutScreen/>:
      page==='overview'?<OverviewScreen navigate={navigate}/>:
      page==='proxies'?<ProxiesScreen openGroup={tag=>openDetail({type:'group',tag})}/>:
      page==='resources'?<ResourcesScreen/>:
      page==='rules'?<RulesScreen/>:
      <SettingsScreen openJson={()=>openDetail({type:'json'})} openAbout={()=>openDetail({type:'about'})}/>}
   </main>
   {!detail&&<nav className="grid shrink-0 grid-cols-5 gap-1 border-t bg-background px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2" aria-label="底部主导航">
     {destinations.map(item=>{
       const Icon=page===item.id?item.selectedIcon:item.icon
       return <Button type="button" key={item.id} variant={page===item.id?'secondary':'ghost'} size="sm" aria-current={page===item.id?'page':undefined}
          className="h-[60px] min-w-0 flex-col gap-1 rounded-lg px-0.5 py-1.5 text-[11px]" onClick={()=>navigate(item.id)}>
         <Icon size={22} strokeWidth={page===item.id?2.25:1.85}/><span className="text-[11px] leading-tight">{item.title}</span>
       </Button>
     })}
   </nav>}
   {notice&&<div className="fixed bottom-[calc(90px+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg" role="status">{notice}
    <Button size="icon" variant="ghost" aria-label="关闭消息" onClick={clearNotice}><X size={18}/></Button></div>}
   <AddSheet kind={sheet} onOpenChange={v=>{if(!v)setSheet(null)}}/>
 </div>
}
