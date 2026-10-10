import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, CheckCircle2, CircleStop, Clock3, Globe2, Network, Play, Radio, Server, ShieldCheck, Wifi, Zap } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { demoNodes, recentConnections } from '../lib/demo'
import { useUI } from '../store/use-ui'

const down=[22,33,39,36,51,68,59,62,47,49,45,60,67,78,63,65,50,70,58,46,62,64,49]
const up=[9,17,23,20,18,13,22,16,19,17,25,32,26,18,21,14,23,18,16,20,15,19,12]
const makePath=(vals:number[])=>vals.map((v,i)=>`${i?'L':'M'} ${i*20} ${95-v}`).join(' ')

export function OverviewPage(){
 const {demoRunning,setRunning,setPage,nodes,sources,config}=useUI()
 return <div className="page">
   <div className="page-heading"><div><div className="eyebrow">网络控制台 / OVERVIEW</div><h1>概览</h1><p>掌握网络连接状态、运行表现和资源健康。</p></div><Badge tone="blue">演示环境</Badge></div>
   <Card className={'connection-hero '+(demoRunning?'connected':'disconnected')}>
     <div className="hero-icon">{demoRunning?<CheckCircle2 size={30}/>:<CircleStop size={30}/>}</div>
     <div className="hero-copy"><h2>{demoRunning?'代理已连接':'代理已停止'}<span className="hero-sample">模拟状态</span></h2>
       <p>Android Root · TUN / eBPF <span className="dot-sep">·</span> NiPath Core 1.0（演示）</p><small>{demoRunning?'演示流量经过 NiPath 转发 — 并未接管真实设备网络':'此页面仅展示模拟停止状态，没有实际更改系统代理'}</small>
     </div>
     <Button className={'hero-action '+(demoRunning?'stop-action':'')} onClick={()=>setRunning(!demoRunning)} variant={demoRunning?'danger':'default'}>{demoRunning?<><CircleStop size={16}/> 停止代理</>:<><Play size={16}/> 启动代理</>}</Button>
   </Card>
   <div className="dashboard-grid">
     <Card className="traffic-card">
       <div className="section-head"><div><CardTitle>实时流量</CardTitle><p>过去 2 分钟 · 演示样本</p></div><span className="chip"><Radio size={13}/> 实时模拟</span></div>
       <div className="rates"><div className="rate"><span className="rate-icon down"><ArrowDownToLine size={22}/></span><div><div>下载速度</div><strong>{demoRunning?'12.4':'0'} <small>MB/s</small></strong></div></div>
        <div className="rate"><span className="rate-icon up"><ArrowUpFromLine size={22}/></span><div><div>上传速度</div><strong>{demoRunning?'2.6':'0'} <small>MB/s</small></strong></div></div></div>
       <div className="chart-container"><svg viewBox="0 0 440 114" role="img" aria-label="模拟流量走势图" preserveAspectRatio="none"><defs><linearGradient id="bluefill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4f91ff" stopOpacity=".23"/><stop offset="1" stopColor="#4f91ff" stopOpacity="0"/></linearGradient><linearGradient id="greenfill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#16b68a" stopOpacity=".19"/><stop offset="1" stopColor="#16b68a" stopOpacity="0"/></linearGradient></defs>
         {[20,50,80].map(y=><line key={y} x1="0" x2="440" y1={y} y2={y} stroke="#eaf0fa" strokeDasharray="3 5"/>)}
         <path d={makePath(demoRunning?down:down.map(()=>0))+' L 440 114 L 0 114 Z'} fill="url(#bluefill)"/><path d={makePath(demoRunning?up:up.map(()=>0))+' L 440 114 L 0 114 Z'} fill="url(#greenfill)"/>
         <path d={makePath(demoRunning?down:down.map(()=>0))} stroke="#397df1" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d={makePath(demoRunning?up:up.map(()=>0))} stroke="#17b88b" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
       </svg><div className="chart-axis"><span>2 分钟前</span><span>1 分钟前</span><span>现在</span></div></div>
       <div className="traffic-foot"><div><ArrowDownToLine size={16}/> 总下载 <b>1.42 GB</b></div><div><ArrowUpFromLine size={16}/> 总上传 <b>286 MB</b></div><div><Network size={16}/> 活动连接 <b>{demoRunning?'132':'0'}</b></div></div>
     </Card>
     <Card className="status-card"><div className="section-head"><CardTitle>运行概况</CardTitle><Badge tone={demoRunning?'green':'neutral'}>{demoRunning?'Ready':'Stopped'}</Badge></div>
      <div className="stat-list"><div><span className="stat-icon"><Wifi size={18}/></span><div><small>接管模式</small><strong>Android Root</strong></div></div><div><span className="stat-icon"><Clock3 size={18}/></span><div><small>运行时间</small><strong>{demoRunning?'02:18:36':'00:00:00'}</strong></div></div><div><span className="stat-icon"><Server size={18}/></span><div><small>节点数</small><strong>{nodes.length}（样本）</strong></div></div><div><span className="stat-icon"><ShieldCheck size={18}/></span><div><small>策略组数</small><strong>{config.outbounds.length}</strong></div></div></div>
     </Card>
   </div>
   <div className="summary-grid">
    <Card><div className="section-head"><CardTitle>当前代理</CardTitle><button className="text-link" onClick={()=>setPage('proxies')}>查看代理 <ArrowRight size={15}/></button></div>
      <div className="kv-list"><div><span>出口节点</span><b>🇺🇸 {demoNodes[0].name}</b></div><div><span>所属策略组</span><b>默认代理</b></div><div><span>节点类型</span><b>Shadowsocks · TLS</b></div><div><span>服务器地址</span><b>us01.example.com:443</b></div><div><span>演示延迟</span><Badge tone="green">58 ms</Badge></div></div>
    </Card>
    <Card><div className="section-head"><CardTitle>最近连接</CardTitle><Badge tone="neutral">示例</Badge></div>
      <div className="connections">{recentConnections.map(c=><div key={c.name}><span className="conn-emoji">{c.icon}</span><div><b>{c.name}</b><small>{c.type}</small></div><Badge tone="green">{c.time}</Badge></div>)}</div>
    </Card>
    <Card><div className="section-head"><CardTitle>资源状态</CardTitle><button className="text-link" onClick={()=>setPage('resources')}>管理资源 <ArrowRight size={15}/></button></div>
      <div className="resources-stat"><div><span><Globe2 size={16}/> 订阅总数</span><strong>{sources.length}</strong></div><div><span><Server size={16}/> 节点总数</span><strong>{nodes.length}</strong></div><div><span><Zap size={16}/> 策略组数量</span><strong>{config.outbounds.length}</strong></div><div><span><CheckCircle2 size={16}/> 最新更新</span><strong>2 分钟前（演示）</strong></div></div>
    </Card>
   </div>
 </div>
}
