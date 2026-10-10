import * as React from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine,
  Check, CheckCheck, ChevronRight, CircleHelp, Code2, Globe2, HardDrive,
  Home, Layers3, Moon, Network, Pause, Play, Plus, RefreshCw,
  Route, Search, Settings2, ShieldCheck, SlidersHorizontal, Sun, Trash2, Wifi, X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { useUI, type Page } from '@/store/use-ui'
import { latencyText, type Group } from '@/lib/demo'
import './android.css'

/**
 * Android-compact presentation, separate from the desktop shadcn dashboard.
 * The data and commands are intentionally the SAME Zustand demo state.
 * Material 3 inspired React/WebView UI; not a Jetpack Compose implementation.
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
 return <button type="button" className="a-icon-button" aria-label={label} onClick={onClick}>{children}</button>
}
function Section({title,children}: {title:string;children:React.ReactNode}) {
 return <section className="a-section"><h2 className="a-section-label">{title}</h2><div className="a-section-body">{children}</div></section>
}
function Row({icon,iconClassName='',title,subtitle,trailing,onClick,disabled}: {
 icon:React.ReactNode;iconClassName?:string;title:string;subtitle?:string;trailing?:React.ReactNode;onClick?:()=>void;disabled?:boolean
}) {
 const content=<><span className={'a-row-icon '+iconClassName}>{icon}</span><span className="a-row-copy"><span className="a-row-title">{title}</span>{subtitle&&<span className="a-row-subtitle">{subtitle}</span>}</span>{trailing??(onClick?<ChevronRight size={19} className="a-trailing"/>:null)}</>
 return onClick?<button className="a-row" type="button" onClick={onClick} disabled={disabled}>{content}</button>:<div className="a-row">{content}</div>
}
function DemoNote({children}: {children?:React.ReactNode}) {
 return <p className="a-demo-note"><CircleHelp size={16} aria-hidden="true"/>{children||'这里展示的是演示数据，没有连接真实 NiPath Core。'}</p>
}
function OverviewScreen({navigate}: {navigate:(page:Page)=>void}) {
 const {demoRunning,setRunning,nodes,sources,config}=useUI()
 return <div className="a-content">
   <div className="a-overview-greeting"><p className="a-eyebrow">NIPath · Android</p><h1>网络概览</h1><p>简单掌控，每一条连接。</p></div>
   <section className={'a-hero '+(demoRunning?'is-connected':'')}>
     <div className="a-hero-top"><span className="a-hero-icon"><ShieldCheck size={30} strokeWidth={1.8}/></span><span className="a-tonal-chip">{demoRunning?'模拟已连接':'模拟已停止'}</span></div>
     <div><h2>{demoRunning?'保护已开启':'代理未运行'}</h2><p>Android Root · TUN / eBPF · 演示模式</p></div>
     <button type="button" className="a-filled-action" onClick={()=>setRunning(!demoRunning)}>{demoRunning?<Pause size={19}/>:<Play size={19}/>} {demoRunning?'停止代理':'启动代理'}</button>
     <p className="a-hero-disclaimer">此按钮仅改变页面状态，不会操作实际网络。</p>
   </section>
   <div className="a-metric-grid">
     <div className="a-metric"><span><ArrowDownToLine size={17}/> 下载</span><strong>{demoRunning?'12.4':'0'} <small>MB/s</small></strong><span className="a-metric-caption">模拟实时速度</span></div>
     <div className="a-metric"><span><ArrowUpFromLine size={17}/> 上传</span><strong>{demoRunning?'2.6':'0'} <small>MB/s</small></strong><span className="a-metric-caption">模拟实时速度</span></div>
   </div>
   <Section title="运行状态"><Row icon={<Activity size={21}/>} title="活跃连接" subtitle="仅为演示数值" trailing={<span className="a-row-value">{demoRunning?'132':'0'}</span>}/>
   <Row icon={<Network size={21}/>} title="策略组" subtitle="JSON 配置定义" trailing={<span className="a-row-value">{config.outbounds.length}</span>}/></Section>
   <Section title="常用操作">
     <Row icon={<Globe2 size={21}/>} title="代理策略" subtitle="切换节点，查看测速" onClick={()=>navigate('proxies')}/>
     <Row icon={<HardDrive size={21}/>} title="订阅资源" subtitle={sources.length+' 个订阅 · '+nodes.length+' 个示例节点'} onClick={()=>navigate('resources')}/>
   </Section>
   <DemoNote/>
 </div>
}
function ProxiesScreen({openGroup,onAdd}: {openGroup:(tag:string)=>void;onAdd:()=>void}) {
 const {config,selected,nodes}=useUI()
 const [search,setSearch]=React.useState('')
 const groups=config.outbounds.filter(g=>g.tag.toLowerCase().includes(search.toLowerCase()))
 return <div className="a-content">
   <div className="a-screen-lead"><h1>代理</h1><p>选择策略组，管理节点与自动分流。</p></div>
   <label className="a-search"><Search size={20}/><span className="sr-only">搜索策略组</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索策略组"/></label>
   <Section title={'策略组 · '+config.outbounds.length}>
    {groups.map(g=>{
     const current=nodes.find(n=>n.tag===selected[g.tag])?.name||selected[g.tag]
     const secondary=g.type==='selector'?('手动选择 · '+(current||'未选择')):g.type==='urltest'?'自动测速 · 根据延迟选择':'负载均衡 · 按连接调度'
     return <Row key={g.tag} icon={g.type==='selector'?<Network size={21}/>:g.type==='urltest'?<Activity size={21}/>:<Layers3 size={21}/>}
       title={g.tag} subtitle={secondary} onClick={()=>openGroup(g.tag)} />
    })}
    {!groups.length&&<div className="a-empty">没有匹配的策略组</div>}
   </Section>
   <DemoNote>策略组数据来自同一份演示 JSON；当前选择并非真实出口。</DemoNote>
   <button type="button" className="a-fab" onClick={onAdd} aria-label="添加策略组"><Plus size={23}/></button>
 </div>
}
function GroupDetail({tag}: {tag:string}) {
 const {config,nodes,selected,selectNode,show,removeGroup}=useUI()
 const g=config.outbounds.find(x=>x.tag===tag)
 const [search,setSearch]=React.useState('')
 if(!g)return <div className="a-content a-empty">策略组不存在</div>
 const isManual=g.type==='selector'
 const members=g.outbounds.filter(id=>id.toLowerCase().includes(search.toLowerCase())||nodes.some(n=>n.tag===id&&n.name.toLowerCase().includes(search.toLowerCase())))
 return <div className="a-content a-detail-content">
   <div className="a-detail-summary"><span className="a-detail-icon"><Network size={26}/></span><h1>{g.tag}</h1><p>{isManual?'手动选择':g.type==='urltest'?'自动测速':'负载均衡'} · {g.outbounds.length} 个候选</p></div>
   <div className="a-info-panel"><span>{isManual?'已选节点（演示）':g.type==='urltest'?'测速策略':'连接分配策略'}</span><strong>{isManual?(nodes.find(n=>n.tag===selected[g.tag])?.name||selected[g.tag]||'暂无选择'):g.type==='urltest'?'自动选择最佳出口':g.strategy||'按连接调度'}</strong></div>
   <label className="a-search"><Search size={20}/><span className="sr-only">搜索成员</span><input placeholder="搜索候选节点" value={search} onChange={e=>setSearch(e.target.value)}/></label>
   <Section title="候选节点">
    {members.map(id=>{const node=nodes.find(n=>n.tag===id),chosen=isManual&&selected[g.tag]===id;return <Row key={id} icon={<Globe2 size={21}/>} title={node?node.flag+' '+node.name:id}
      subtitle={(node?.source||'其他出站')+' · '+(node?latencyText(node.latency):'嵌套策略组')}
      trailing={isManual?(chosen?<span className="a-row-selected"><Check size={18}/></span>:<span className="a-row-value">选择</span>):<span className="a-row-value">自动</span>}
      onClick={()=>isManual?selectNode(g.tag,id):show('此组由内核自动选择，不能手动指定全局出口')}/>})}
    {!members.length&&<div className="a-empty">暂无候选成员</div>}
   </Section>
   <button type="button" className="a-outline-action" onClick={()=>show('演示：未连接真实 sing-box URLTest RPC')}><RefreshCw size={18}/> 测试节点延迟</button>
   {g.tag!=='默认代理'&&<button type="button" className="a-danger-link" onClick={()=>removeGroup(g.tag)}><Trash2 size={17}/> 删除策略组（演示）</button>}
   <DemoNote>{g.type==='load-balance'?'负载均衡不存在全局选中的固定节点。':'节点选择与延迟均为演示，不代表真实连接。'}</DemoNote>
 </div>
}
function ResourcesScreen({onAdd}: {onAdd:()=>void}) {
 const {sources,nodes,refreshSource}=useUI()
 const [tab,setTab]=React.useState<'sources'|'nodes'>('sources')
 return <div className="a-content">
   <div className="a-screen-lead"><h1>资源</h1><p>订阅和节点统一管理。</p></div>
   <div className="a-segmented" role="tablist" aria-label="资源类型">
     <button type="button" role="tab" aria-selected={tab==='sources'} className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>订阅 · {sources.length}</button>
     <button type="button" role="tab" aria-selected={tab==='nodes'} className={tab==='nodes'?'active':''} onClick={()=>setTab('nodes')}>节点 · {nodes.length}</button>
   </div>
   {tab==='sources'?<Section title="订阅列表">
    {sources.map(s=><div className="a-source" key={s.id}>
      <div className="a-source-top"><div className="a-row-icon"><Globe2 size={21}/></div><div className="a-row-copy"><strong className="a-row-title">{s.name}</strong><span className="a-row-subtitle">{s.count} 个节点 · {s.traffic}</span></div><button className="a-icon-button" aria-label={'刷新'+s.name} onClick={()=>refreshSource(s.id)}><RefreshCw size={19}/></button></div>
      <div className="a-source-foot"><span>{s.updated}</span><span className="a-status-chip">{s.status==='applied'?'已生效（演示）':s.status==='failed'?'更新失败':'等待内核确认'}</span></div>
    </div>)}
    </Section>:<Section title="节点列表">{nodes.map(n=><Row key={n.tag} icon={<Wifi size={21}/>} title={n.flag+' '+n.name} subtitle={n.source+' · '+n.protocol} trailing={<span className="a-row-value">{latencyText(n.latency)}</span>}/>)}</Section>}
   <DemoNote>订阅刷新后需要内核明确回执，不能将下载完成误报为已生效。</DemoNote>
   <button type="button" className="a-fab" onClick={onAdd} aria-label="添加订阅"><Plus size={23}/></button>
 </div>
}
function RulesScreen({onAdd}: {onAdd:()=>void}) {
 const {config,toggleRule,show}=useUI()
 const [tab,setTab]=React.useState<'route'|'dns'>('route')
 return <div className="a-content">
   <div className="a-screen-lead"><h1>规则</h1><p>管理路由与 DNS 规则。</p></div>
   <div className="a-segmented" role="tablist" aria-label="规则类型"><button type="button" role="tab" aria-selected={tab==='route'} className={tab==='route'?'active':''} onClick={()=>setTab('route')}>路由规则</button><button type="button" role="tab" aria-selected={tab==='dns'} className={tab==='dns'?'active':''} onClick={()=>setTab('dns')}>DNS 规则</button></div>
   {tab==='route'?<Section title={'路由 · '+config.route.rules.length}>{config.route.rules.map(r=><div className="a-rule" key={r.id}><div className="a-row-copy"><span className="a-row-title">{r.match}</span><span className="a-row-subtitle">目标：{r.outbound}</span></div><Switch checked={r.enabled} onCheckedChange={()=>toggleRule(r.id)} aria-label={r.enabled?'停用规则':'启用规则'}/></div>)}</Section>:
    <Section title="DNS"><Row icon={<Layers3 size={21}/>} title="DNS 规则" subtitle="当前演示配置暂无 DNS 规则" onClick={()=>show('DNS 规则未来将直接读取原生 JSON')}/></Section>}
   <DemoNote>这里只对演示 JSON 进行修改，未进行真实路由命中与配置校验。</DemoNote>
   {tab==='route'&&<button type="button" className="a-fab" onClick={onAdd} aria-label="新增路由规则"><Plus size={23}/></button>}
 </div>
}
function SettingsScreen({openJson,openAbout}: {openJson:()=>void;openAbout:()=>void}) {
 const {theme,setTheme,revision,show}=useUI()
 return <div className="a-content">
   <div className="a-screen-lead"><h1>设置</h1><p>NiPath 的偏好和运行参数。</p></div>
   <Section title="个性化"><Row icon={theme==='dark'?<Moon size={21}/>:<Sun size={21}/>} title="深色主题" subtitle="跟随 NiPath 当前显示设置"
     trailing={<Switch checked={theme==='dark'} onCheckedChange={v=>setTheme(v?'dark':'light')} aria-label="深色主题"/>}/></Section>
   <Section title="内核与配置">
    <Row icon={<Wifi size={21}/>} title="网络接管" subtitle="Root · TUN / eBPF（演示）" onClick={()=>show('真实模式需要 Android Platform Host 与 Go Core')}/>
    <Row icon={<Code2 size={21}/>} title="原生配置" subtitle={'JSON 配置 · 修订 '+revision} onClick={openJson}/>
    <Row icon={<SlidersHorizontal size={21}/>} title="DNS 与规则" subtitle="从同一份原生配置读取" onClick={()=>show('DNS 设置需要 Core 的原生配置事务能力')}/>
   </Section>
   <Section title="更多"><Row icon={<ShieldCheck size={21}/>} title="安全与访问" subtitle="独立后台服务 · 本地鉴权（规划中）" onClick={()=>show('正式版将由 Core 负责鉴权与高权限调用')}/>
     <Row icon={<CircleHelp size={21}/>} title="关于 NiPath" subtitle="NiPath 1.0 · Android 演示" onClick={openAbout}/>
   </Section>
   <DemoNote/>
 </div>
}
function JsonScreen(){
 const {config,setRawConfig,revision,show}=useUI()
 const [raw,setRaw]=React.useState(()=>JSON.stringify(config,null,2))
 const [error,setError]=React.useState('')
 function save(){const r=setRawConfig(raw);setError(r.ok?'':r.error||'配置无效');if(r.ok)show('演示 JSON 已写入本地状态，未应用到真实内核')}
 return <div className="a-content a-detail-content">
   <div className="a-screen-lead"><h1>原生配置</h1><p>配置修订 {revision} · 演示 JSON 编辑器</p></div>
   <div className="a-info-panel"><strong>单一配置事实源</strong><span>这里不会创建第二套规则或策略组数据。</span></div>
   <Textarea className="a-json" value={raw} onChange={e=>setRaw(e.target.value)} spellCheck={false} aria-label="原生 JSON 配置"/>
   {error&&<p className="a-error" role="alert">{error}</p>}
   <button type="button" className="a-filled-action" onClick={save}><CheckCheck size={18}/> 保存演示配置</button>
   <DemoNote>并非完整 sing-box Schema，也不会实际应用到内核。</DemoNote>
 </div>
}
function AboutScreen(){
 return <div className="a-content a-detail-content"><div className="a-about-icon"><Network size={35}/></div><h1 className="a-about-title">NiPath</h1><p className="a-about-caption">奶屁 · NP</p>
 <Section title="应用信息"><Row icon={<ShieldCheck size={21}/>} title="产品目标版本" trailing={<span className="a-row-value">1.0.0</span>}/>
 <Row icon={<Code2 size={21}/>} title="当前客户端" trailing={<span className="a-row-value">WebUI 演示版</span>}/></Section>
 <a className="a-outline-action" href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer">GitHub 架构仓库 <ArrowRight size={18}/></a>
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
    <SheetContent side="bottom" className="a-bottom-sheet" showCloseButton={false}>
      <div className="a-sheet-handle" aria-hidden="true"/>
      <SheetHeader><SheetTitle>{kind==='group'?'新建策略组':kind==='source'?'添加订阅':'新增路由规则'}</SheetTitle><SheetDescription>这是本地演示操作，不会控制真实内核。</SheetDescription></SheetHeader>
      <div className="a-sheet-form">
       <label className="a-field-label">{kind==='rule'?'匹配条件':kind==='source'?'订阅名称':'策略组名称'}<Input value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='rule'?'domain_suffix: example.com':kind==='source'?'我的订阅':'媒体代理'}/></label>
       {kind==='source'&&<label className="a-field-label">订阅 URL<Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/sub"/></label>}
       {kind==='group'&&<><label className="a-field-label">组类型<NativeSelect value={groupType} onChange={e=>setGroupType(e.target.value as Group['type'])}><option value="selector">手动选择</option><option value="urltest">自动测速</option><option value="load-balance">负载均衡</option></NativeSelect></label><label className="a-field-label">候选成员 tag<Textarea value={members} onChange={e=>setMembers(e.target.value)} placeholder="输入一个或多个成员，用换行分隔"/></label></>}
       {kind==='rule'&&<label className="a-field-label">目标出站<NativeSelect value={outbound} onChange={e=>setOutbound(e.target.value)}><option value="direct">direct</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}</NativeSelect></label>}
       <div className="a-sheet-actions"><button className="a-outline-action" type="button" onClick={close}>取消</button><button className="a-filled-action" type="button" onClick={submit}>确认添加</button></div>
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
 return <div className={'android-app '+(theme==='dark'?'a-dark':'')} data-testid="android-shell">
   <header className="a-appbar">
     {detail?<IconButton label="返回" onClick={back}><ArrowLeft size={24}/></IconButton>:<span className="a-brandmark"><Network size={24}/></span>}
     <span className="a-appbar-title">{title}</span>
     {!detail&&<span className="a-appbar-demo">DEMO</span>}
     {!detail&&<IconButton label="帮助" onClick={()=>clearNotice()}><CircleHelp size={23}/></IconButton>}
   </header>
   <main className="a-scroll" ref={scrollRef} key={detail?detail.type==='group'?detail.tag:detail.type:page}>
     {detail?.type==='group'?<GroupDetail tag={detail.tag}/>:
      detail?.type==='json'?<JsonScreen/>:
      detail?.type==='about'?<AboutScreen/>:
      page==='overview'?<OverviewScreen navigate={navigate}/>:
      page==='proxies'?<ProxiesScreen openGroup={tag=>openDetail({type:'group',tag})} onAdd={()=>setSheet('group')}/>:
      page==='resources'?<ResourcesScreen onAdd={()=>setSheet('source')}/>:
      page==='rules'?<RulesScreen onAdd={()=>setSheet('rule')}/>:
      <SettingsScreen openJson={()=>openDetail({type:'json'})} openAbout={()=>openDetail({type:'about'})}/>}
   </main>
   {!detail&&<nav className="a-bottom-nav" aria-label="底部主导航">
     {destinations.map(item=>{
       const Icon=page===item.id?item.selectedIcon:item.icon
       return <button type="button" key={item.id} aria-current={page===item.id?'page':undefined} className={'a-nav-item '+(page===item.id?'is-active':'')} onClick={()=>navigate(item.id)}>
         <span className="a-nav-indicator"><Icon size={23} strokeWidth={page===item.id?2.25:1.85}/></span><span className="a-nav-label">{item.title}</span>
       </button>
     })}
   </nav>}
   {notice&&<div className="a-snackbar" role="status">{notice}<button type="button" aria-label="关闭消息" onClick={clearNotice}><X size={18}/></button></div>}
   <AddSheet kind={sheet} onOpenChange={v=>{if(!v)setSheet(null)}}/>
 </div>
}
