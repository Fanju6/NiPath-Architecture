import { ArrowDown, ArrowRight, CircleHelp, Code2, GitMerge, GripVertical, Layers2, Plus, Search, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useUI } from '../store/use-ui'
const schema=z.object({match:z.string().trim().min(3,'请输入匹配条件'),outbound:z.string().min(1)})
type Form=z.infer<typeof schema>
export function RulesPage(){
 const {config,addRule,toggleRule,removeRule,setPage,show}=useUI()
 const [tab,setTab]=useState('routes'),[open,setOpen]=useState(false),[filter,setFilter]=useState('')
 const [example,setExample]=useState('api.openai.com')
 const {register,handleSubmit,reset,formState:{errors}}=useForm<Form>({resolver:zodResolver(schema),defaultValues:{match:'domain_suffix: ',outbound:'默认代理'}})
 const submit=(r:Form)=>{addRule({id:'r'+Date.now(),match:r.match,outbound:r.outbound,enabled:true});reset();setOpen(false)}
 const rules=config.route.rules.filter(r=>r.match.toLowerCase().includes(filter.toLowerCase())||r.outbound.toLowerCase().includes(filter.toLowerCase()))
 const mockMatching=config.route.rules.find(r=>example.toLowerCase().includes('openai')?r.match.includes('openai'):example.toLowerCase().includes('github')?r.match.includes('github'):r.match==='final')
 return <div className="page">
   <div className="page-heading"><div><div className="eyebrow">POLICY / RULES</div><h1>规则</h1><p>决定流量经过哪个出站或策略组。</p></div><Button onClick={()=>setOpen(true)}><Plus size={17}/> 新建规则</Button></div>
   <div className="page-hint"><Shield size={17}/> 路由与 DNS 规则均属于唯一原生 sing-box JSON。规则调整不会写入独立的 Policy Store。</div>
   <Tabs value={tab} onValueChange={setTab}>
     <TabsList className="page-tabs"><TabsTrigger value="routes">路由规则</TabsTrigger><TabsTrigger value="dns">DNS 规则</TabsTrigger><TabsTrigger value="test">规则匹配测试</TabsTrigger></TabsList>
     <TabsContent value="routes"><Card><div className="section-head"><div><CardTitle>路由规则 <Badge tone="blue">{config.route.rules.length}</Badge></CardTitle><p>自上而下匹配，优先命中靠前规则</p></div><Badge tone="neutral">演示配置</Badge></div>
       <div className="searchbox rule-search"><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="搜索规则 / 目标出站" aria-label="搜索路由规则"/></div>
       <div className="rule-list">{rules.map((r,i)=><div key={r.id} className={'rule-item '+(!r.enabled?'disabled':'')}>
         <span className="rule-handle"><GripVertical size={18}/></span><span className="rule-number">{String(i+1).padStart(2,'0')}</span>
         <div className="rule-copy"><b>{r.match}</b><small>策略匹配 · {r.enabled?'已启用':'已停用'}</small></div>
         <span className="rule-target"><ArrowRight size={15}/><b>{r.outbound}</b></span>
         <label className="switch"><input type="checkbox" checked={r.enabled} onChange={()=>toggleRule(r.id)} aria-label={(r.enabled?'停用':'启用')+' '+r.match}/><span/></label>
         <button className="icon-action" aria-label={'删除 '+r.match} title="删除规则" onClick={()=>removeRule(r.id)}><Trash2 size={16}/></button>
       </div>)}{rules.length===0&&<p className="empty-state">未找到匹配的规则</p>}</div>
       <div className="inline-info"><CircleHelp size={16}/> 原型中的拖拽图标只用于展示。正式实现会通过 JSON 修订事务支持可访问的键盘排序和撤销。</div>
     </Card></TabsContent>
     <TabsContent value="dns"><Card><div className="section-head"><div><CardTitle>DNS 规则</CardTitle><p>通过原生 sing-box DNS 配置读取，不额外维护第二份</p></div><Badge tone="neutral">设计阶段</Badge></div>
       <div className="empty-feature"><span><Layers2 size={27}/></span><h3>等待 DNS 配置模型接入</h3><p>这里将展示解析服务器、分流规则、FakeIP、缓存和诊断，并与原生 JSON 编辑器双向对应。目前演示配置中没有 DNS 规则。</p><Button variant="secondary" onClick={()=>setPage('settings')}><Code2 size={16}/> 查看原生 JSON</Button></div>
     </Card></TabsContent>
     <TabsContent value="test"><Card><div className="section-head"><CardTitle>规则匹配测试</CardTitle><Badge tone="amber">静态演示</Badge></div>
      <p className="muted-intro">该功能目前只对示例域名做简单匹配演示，无法证明内核真实路由决策。</p>
      <div className="test-row"><label>测试域名<input value={example} onChange={e=>setExample(e.target.value)} placeholder="api.openai.com"/></label><Button onClick={()=>show('演示：静态规则匹配预览，非 sing-box 数据面结果')}>测试规则 <ArrowDown size={16}/></Button></div>
      <div className="test-result"><div><GitMerge size={20}/><strong>预计匹配（静态演示）</strong></div><p>{mockMatching?mockMatching.match:'未匹配；需检查规则'}</p><span>目标：{mockMatching?.outbound||'未知'}</span></div>
     </Card></TabsContent>
   </Tabs>
   <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>新建路由规则</DialogTitle><DialogDescription className="dialog-subtitle">新增后将同步写入同一份演示 JSON。正式实现还会进行引擎 Schema 与引用校验。</DialogDescription>
    <form className="form-stack" onSubmit={handleSubmit(submit)}><label>匹配条件<input {...register('match')} placeholder="domain_suffix: example.com"/>{errors.match&&<small className="field-error">{errors.match.message}</small>}</label>
      <label>目标出站<select {...register('outbound')}><option value="direct">direct（直连）</option>{config.outbounds.map(g=><option key={g.tag} value={g.tag}>{g.tag}</option>)}</select>{errors.outbound&&<small className="field-error">{errors.outbound.message}</small>}</label>
      <div className="dialog-actions"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>取消</Button><Button type="submit"><Plus size={16}/> 添加规则</Button></div></form>
   </DialogContent></Dialog>
 </div>
}
