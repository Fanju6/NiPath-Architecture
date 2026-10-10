import { ArrowLeft, Check, ChevronRight, CircleHelp, Filter, GitBranch, Globe2, Layers3, Network, Plus, RefreshCcw, Search, Shuffle, Timer, Trash2, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog'
import { latencyText, type Group } from '../lib/demo'
import { useUI } from '../store/use-ui'

const schema=z.object({tag:z.string().trim().min(2,'请输入至少两个字符').max(40),type:z.enum(['selector','urltest','load-balance']),members:z.string().min(1,'请输入至少一个节点或策略组 tag')})
type Form=z.infer<typeof schema>
const kindText={'selector':'手动选择','urltest':'自动选择','load-balance':'负载均衡'}
function KindIcon({type}:{type:Group['type']}){return type==='selector'?<Globe2 size={19}/>:type==='urltest'?<Zap size={19}/>:<Shuffle size={19}/>}

export function ProxiesPage(){
 const {config,nodes,selectedGroup,selectGroup,selected,selectNode,addGroup,removeGroup,show,demoRunning}=useUI()
 const [detailOpen,setDetailOpen]=useState(false)
 const [creating,setCreating]=useState(false)
 const [search,setSearch]=useState('')
 const [memberSearch,setMemberSearch]=useState('')
 const group=config.outbounds.find(g=>g.tag===selectedGroup)||config.outbounds[0]
 const filtered=useMemo(()=>config.outbounds.filter(g=>g.tag.toLowerCase().includes(search.toLowerCase())),[config.outbounds,search])
 const members=(group?.outbounds||[]).filter(tag=>tag.toLowerCase().includes(memberSearch.toLowerCase())||nodes.some(n=>n.tag===tag&&n.name.toLowerCase().includes(memberSearch.toLowerCase())))
 const {register,handleSubmit,reset,formState:{errors}}=useForm<Form>({resolver:zodResolver(schema),defaultValues:{tag:'',type:'selector',members:''}})
 const create=(data:Form)=>{
   if(config.outbounds.some(g=>g.tag===data.tag)){show('策略组名称已存在');return}
   addGroup({tag:data.tag,type:data.type,outbounds:data.members.split(/[\n,，]/).map(s=>s.trim()).filter(Boolean)})
   setCreating(false);setDetailOpen(true);reset()
 }
 const select=(tag:string)=>{selectGroup(tag);setDetailOpen(true);setMemberSearch('')}
 if(!group)return <Card>暂无策略组。通过“新建策略组”向原生 JSON 添加一个。</Card>
 return <div className="page">
   <div className="page-heading"><div><div className="eyebrow">ROUTING / PROXY GROUPS</div><h1>代理</h1><p>策略组由同一份 sing-box 原生 JSON 定义。</p></div>
    <Button onClick={()=>setCreating(true)}><Plus size={17}/> 新建策略组</Button></div>
   <div className="page-hint"><CircleHelp size={17}/><span>Selector 可手动切换，URLTest 自动选优，LoadBalance 按连接分流。本页面为操作演示，未连接内核。</span></div>
   <div className="proxy-layout">
      <Card className={'group-panel '+(detailOpen?'mobile-hide':'')}>
        <div className="panel-title"><CardTitle>策略组 <Badge tone="blue">{config.outbounds.length}</Badge></CardTitle></div>
        <div className="searchbox"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索策略组" aria-label="搜索策略组"/></div>
        <div className="group-list">{filtered.length===0&&<p className="empty-state">没有符合条件的策略组</p>}
         {filtered.map(g=><button className={'group-item '+(selectedGroup===g.tag?'selected':'')} key={g.tag} onClick={()=>select(g.tag)}>
           <span className={'group-icon '+g.type}><KindIcon type={g.type}/></span>
           <span className="group-item-copy"><b>{g.tag}</b><small>{kindText[g.type]} · {g.outbounds.length} 个静态引用</small></span>
           <ChevronRight size={17} className="group-chevron"/>
         </button>)}
        </div>
        <div className="panel-foot"><Network size={15}/> 来自原生 JSON，演示动态 UI</div>
      </Card>
      <Card className={'group-detail '+(!detailOpen?'mobile-hide':'')}>
       <div className="detail-back"><button onClick={()=>setDetailOpen(false)}><ArrowLeft size={17}/> 返回策略组</button></div>
       <div className="detail-head">
          <div className={'group-icon large '+group.type}><KindIcon type={group.type}/></div>
          <div className="detail-titles"><div className="eyebrow">PROXY GROUP</div><h2>{group.tag}</h2><p>{kindText[group.type]} · {group.outbounds.length} 个静态引用</p></div>
          <Badge tone={demoRunning?'green':'amber'}>{demoRunning?'运行中（演示）':'内核停止（演示）'}</Badge>
       </div>
       <div className="group-current">
         {group.type==='selector'?<><div><small>当前所选节点（演示）</small><strong>{nodes.find(n=>n.tag===selected[group.tag])?.name||selected[group.tag]||'尚未选择'}</strong></div><Badge tone="blue">手动</Badge></>
         :group.type==='urltest'?<><div><small>选择机制</small><strong>自动选优 · TCP/UDP 可能不同</strong></div><Badge tone="green">URLTest</Badge></>
         :<><div><small>调度策略</small><strong>{group.strategy||'round-robin'}</strong></div><Badge tone="blue">连接级</Badge></>}
       </div>
       <div className="section-head subhead"><div><CardTitle>候选成员</CardTitle><p>展示配置内引用，来源与延迟来自演示数据</p></div><Button size="sm" variant="outline" onClick={()=>show('演示：测速未调用 sing-box URLTest RPC，结果不会更新')}><RefreshCcw size={14}/> 测速</Button></div>
       <div className="searchbox member-search"><Filter size={16}/><input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} placeholder="筛选节点或策略组" aria-label="筛选候选成员"/></div>
       <div className="member-list">{members.length===0&&<p className="empty-state">暂无候选成员或筛选结果</p>}
       {members.map(tag=>{
          const node=nodes.find(n=>n.tag===tag);const sub=config.outbounds.find(g=>g.tag===tag);const builtin=tag==='direct'||tag==='block';
          const isSelected=group.type==='selector'&&selected[group.tag]===tag
          return <button key={tag} className={'member-row '+(isSelected?'chosen':'')} onClick={()=>{
            if(group.type==='selector')selectNode(group.tag,tag)
            else show('演示：该策略组由引擎自动调度，不支持手动指定当前节点')
          }} disabled={group.type!=='selector'} aria-pressed={group.type==='selector'?isSelected:undefined}>
            <span className="node-flag">{node?.flag||(sub?'🧭':builtin?'🔗':'🌍')}</span>
            <span className="member-copy"><b>{node?.name||sub?.tag||tag}</b><small>{node?.source|| (sub?'嵌套策略组':builtin?'内置出站':'未解析的引用')} · {node?.protocol||sub?.type||'出站'}</small></span>
            {node&&<Badge tone={node.latency===null?'neutral':node.latency<100?'green':'amber'}>{latencyText(node.latency)}</Badge>}
            {isSelected?<Check className="member-check" size={17}/>:group.type==='selector'?<span className="member-select-hint">选择</span>:null}
          </button>
        })}
       </div>
       <div className="detail-footer"><div><Layers3 size={16}/> 组类型：<strong>{group.type}</strong></div><div><Timer size={16}/> 配置版本：<strong>演示修订</strong></div></div>
       <div className="detail-actions"><Button variant="outline" size="sm" onClick={()=>show('演示：实际产品将在此打开策略组编辑表单，写入同一原生 JSON')}><GitBranch size={15}/> 编辑配置</Button><Button variant="danger" size="sm" onClick={()=>{
         if(group.tag==='默认代理'){show('演示：默认代理被保护，避免移除后丢失路由引用');return}
         removeGroup(group.tag);setDetailOpen(false)
       }}><Trash2 size={15}/> 删除此组</Button></div>
      </Card>
   </div>
   <Dialog open={creating} onOpenChange={setCreating}><DialogContent><DialogTitle>新建策略组</DialogTitle><DialogDescription className="dialog-subtitle">在同一份原生 sing-box JSON 中创建策略组，不存在第二种配置模式。</DialogDescription>
    <form className="form-stack" onSubmit={handleSubmit(create)}>
       <label>策略组名称<input placeholder="例如：流媒体节点" {...register('tag')}/>{errors.tag&&<small className="field-error">{errors.tag.message}</small>}</label>
       <label>组类型<select {...register('type')}><option value="selector">Selector · 手动选择</option><option value="urltest">URLTest · 自动选择</option><option value="load-balance">LoadBalance · 负载均衡</option></select></label>
       <label>候选成员 tag（逗号或换行分隔）<textarea rows={4} placeholder="sub-1/us-los-angeles-01&#10;sub-1/jp-tokyo-03" {...register('members')}/>{errors.members&&<small className="field-error">{errors.members.message}</small>}</label>
       <div className="dialog-actions"><Button type="button" variant="outline" onClick={()=>setCreating(false)}>取消</Button><Button type="submit"><Plus size={16}/> 创建（演示）</Button></div>
    </form>
   </DialogContent></Dialog>
 </div>
}
