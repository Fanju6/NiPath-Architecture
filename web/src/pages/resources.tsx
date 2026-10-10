import { NativeSelect } from '../components/ui/native-select'
import { Input } from '../components/ui/input'
import { ArrowDownToLine, Boxes, CalendarClock, ChevronRight, CircleAlert, CloudDownload, Copy, Globe2, Link2, Plus, RefreshCcw, Search, Server, SlidersHorizontal, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { latencyText, type Source } from '../lib/demo'
import { useUI } from '../store/use-ui'

const sourceSchema=z.object({name:z.string().trim().min(2,'请输入订阅名称'),url:z.string().trim().url('请输入完整的 http(s) URL').refine(s=>s.startsWith('http://')||s.startsWith('https://'),'仅允许 HTTP/HTTPS')})
type NewSource=z.infer<typeof sourceSchema>
const status:{[K in Source['status']]:{label:string;tone:'green'|'amber'|'red'}}={
 applied:{label:'已生效（演示）',tone:'green'},pending:{label:'待确认',tone:'amber'},failed:{label:'失败',tone:'red'}
}
export function ResourcesPage(){
 const {sources,nodes,refreshSource,addSource,show}=useUI()
 const [tab,setTab]=useState('subscriptions')
 const [open,setOpen]=useState(false)
 const [query,setQuery]=useState('')
 const [selectedSource,setSelectedSource]=useState<string>('all')
 const {register,handleSubmit,reset,formState:{errors}}=useForm<NewSource>({resolver:zodResolver(sourceSchema)})
 const filtered=useMemo(()=>nodes.filter(n=>(selectedSource==='all'||n.source===selectedSource)&&(n.name.toLowerCase().includes(query.toLowerCase())||n.protocol.toLowerCase().includes(query.toLowerCase()))),[nodes,query,selectedSource])
 const imported=nodes.filter(n=>n.source==='本地节点')
 const submit=(d:NewSource)=>{addSource(d.name,d.url);reset();setOpen(false);setTab('subscriptions')}
 return <div className="page">
   <div className="page-heading"><div><div className="eyebrow">CATALOG / RESOURCES</div><h1>资源</h1><p>订阅、本地节点和全部节点，统一管理。</p></div><Button onClick={()=>setOpen(true)}><Plus size={17}/> 添加订阅</Button></div>
   <div className="mini-stats"><div><span className="mini-icon"><CloudDownload size={19}/></span><div><b>{sources.length}</b><small>订阅来源</small></div></div><div><span className="mini-icon"><Server size={19}/></span><div><b>{nodes.length}</b><small>演示节点</small></div></div><div><span className="mini-icon"><Wifi size={19}/></span><div><b>{nodes.filter(n=>n.latency!==null).length}</b><small>带延迟数据</small></div></div></div>
   <Tabs value={tab} onValueChange={v=>{setTab(v);setQuery('')}}>
     <TabsList className="page-tabs"><TabsTrigger value="subscriptions">订阅 <span className="tab-count">{sources.length}</span></TabsTrigger><TabsTrigger value="local">本地节点</TabsTrigger><TabsTrigger value="all">全部节点</TabsTrigger></TabsList>
     <TabsContent value="subscriptions">
       <div className="resource-cards">{sources.map(s=><Card key={s.id} className="subscription-card">
         <div className="source-top"><div className="source-icon"><Globe2 size={20}/></div><div className="source-main"><h3>{s.name}</h3><span title={s.url}>{s.url}</span></div><Badge tone={status[s.status].tone}>{status[s.status].label}</Badge></div>
         <div className="source-kpis"><div><small>节点数量</small><b>{s.count}</b></div><div><small>订阅流量</small><b>{s.traffic}</b></div><div><small>最后更新</small><b>{s.updated}</b></div></div>
         <div className="source-bottom"><span><CalendarClock size={14}/> 下载与生效是不同状态</span><Button size="sm" variant="outline" onClick={()=>refreshSource(s.id)}><RefreshCcw size={14}/> 刷新演示</Button></div>
       </Card>)}</div>
       <div className="inline-info"><CircleAlert size={17}/> <span>演示订阅地址为 example.com；刷新按钮不会发送网络请求，也不会修改 sing-box。正式实现将区分下载、校验、热更新与内核确认。</span></div>
     </TabsContent>
     <TabsContent value="local"><Card><div className="section-head"><div><CardTitle>本地节点</CardTitle><p>手动导入和创建的节点</p></div><Button variant="outline" size="sm" onClick={()=>show('演示：本地节点创建表单待对接 sing-box 原生格式校验')}><Plus size={15}/> 新建节点</Button></div>
       {imported.map(n=><div key={n.tag} className="simple-node"><span className="node-flag">{n.flag}</span><div><b>{n.name}</b><small>{n.protocol} · {n.address}</small></div><Badge tone="neutral">{latencyText(n.latency)}</Badge><ChevronRight size={17}/></div>)}
       <div className="inline-info"><Link2 size={17}/> 后续支持粘贴分享链接、扫码导入和粘贴 sing-box 原生出站配置；同一处管理。</div>
     </Card></TabsContent>
     <TabsContent value="all"><Card>
       <div className="section-head"><div><CardTitle>全部节点</CardTitle><p>按来源、名称或协议筛选</p></div><Badge tone="blue">{filtered.length} 条结果</Badge></div>
       <div className="filter-row"><div className="searchbox"><Search size={16}/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索名称 / 协议" aria-label="搜索全部节点"/></div>
         <label className="filter-select"><SlidersHorizontal size={16}/><NativeSelect value={selectedSource} onChange={e=>setSelectedSource(e.target.value)} aria-label="选择节点来源"><option value="all">全部来源</option>{Array.from(new Set(nodes.map(n=>n.source))).map(src=><option key={src}>{src}</option>)}</NativeSelect></label>
       </div>
       <div className="node-table"><div className="node-table-head"><span>节点 / 地址</span><span>来源</span><span>延迟</span><span/></div>
        {filtered.map(n=><div className="node-table-row" key={n.tag}><div className="node-identity"><span className="node-flag">{n.flag}</span><div><b>{n.name}</b><small>{n.protocol} · {n.address}</small></div></div><span className="source-col">{n.source}</span><Badge tone={n.latency===null?'neutral':n.latency<100?'green':'amber'}>{latencyText(n.latency)}</Badge><button title="复制节点 tag" aria-label={'复制 '+n.tag} onClick={()=>{void navigator.clipboard?.writeText(n.tag);show('已尝试复制节点 tag')}}><Copy size={16}/></button></div>)}
        {filtered.length===0&&<p className="empty-state">没有符合条件的节点</p>}</div>
       <div className="inline-info"><Boxes size={17}/> 这里是资源浏览视图，不会自动根据订阅创建策略组；策略组来自唯一原生 JSON。</div>
     </Card></TabsContent>
   </Tabs>
   <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>添加订阅</DialogTitle><DialogDescription className="dialog-subtitle">保存订阅来源。GitHub Pages 演示中不会实际下载或解析远程内容。</DialogDescription>
      <form className="form-stack" onSubmit={handleSubmit(submit)}><label>订阅名称<Input placeholder="例如：我的订阅" {...register('name')}/>{errors.name&&<small className="field-error">{errors.name.message}</small>}</label>
      <label>订阅地址<Input placeholder="https://example.com/subscription" {...register('url')}/>{errors.url&&<small className="field-error">{errors.url.message}</small>}</label>
      <div className="dialog-actions"><Button variant="outline" type="button" onClick={()=>setOpen(false)}>取消</Button><Button type="submit"><ArrowDownToLine size={16}/> 添加到资源（演示）</Button></div></form>
   </DialogContent></Dialog>
 </div>
}
