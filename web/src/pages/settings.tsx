import { AlertTriangle, Bell, CheckCircle2, Clipboard, Code2, Database, Download, HardDrive, Info, LockKeyhole, Monitor, Moon, Router, Save, Settings2, Shield, SlidersHorizontal, Sun, Terminal, Wifi, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { useUI } from '../store/use-ui'
type Section='general'|'engine'|'dns'|'config'|'security'|'appearance'|'about'
const sections:{key:Section;name:string;icon:typeof Router}[]=[
 {key:'general',name:'通用',icon:Settings2},{key:'engine',name:'内核与接管',icon:HardDrive},
 {key:'dns',name:'DNS 与网络',icon:Wifi},{key:'config',name:'原生配置',icon:Code2},
 {key:'security',name:'安全与访问',icon:Shield},{key:'appearance',name:'外观',icon:Monitor},{key:'about',name:'关于',icon:Info},
]
function SettingRow({icon:Icon,title,detail,children}:{icon:typeof Router;title:string;detail:string;children:React.ReactNode}){return <div className="setting-row"><span className="setting-icon"><Icon size={18}/></span><div className="setting-copy"><b>{title}</b><small>{detail}</small></div><div className="setting-control">{children}</div></div>}
export function SettingsPage(){
 const {config,revision,theme,setTheme,setRawConfig,show,demoRunning}=useUI()
 const [section,setSection]=useState<Section>('general'),[raw,setRaw]=useState(JSON.stringify(config,null,2)),[error,setError]=useState('')
 useEffect(()=>{setRaw(JSON.stringify(config,null,2))},[config])
 const save=()=>{const r=setRawConfig(raw);setError(r.ok?'':r.error||'JSON 无效');if(r.ok)show('演示 JSON 已更新；未写入 Go Core 或 sing-box')}
 const format=()=>{try{setRaw(JSON.stringify(JSON.parse(raw),null,2));setError('')}catch(e){setError(e instanceof Error?e.message:'格式化失败')}}
 const download=()=>{const blob=new Blob([raw],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nipath-demo.json';a.click();URL.revokeObjectURL(url)}
 return <div className="page">
  <div className="page-heading"><div><div className="eyebrow">PREFERENCES / SETTINGS</div><h1>设置</h1><p>管理接管、原生 JSON、安全与界面偏好。</p></div><Badge tone="neutral">演示环境</Badge></div>
  <div className="settings-layout">
    <div className="settings-nav" role="navigation" aria-label="设置分类">{sections.map(s=><button key={s.key} className={section===s.key?'active':''} onClick={()=>setSection(s.key)}><s.icon size={17}/>{s.name}</button>)}</div>
    <div className="settings-main">
     {section==='general'&&<Card><div className="settings-heading"><CardTitle>通用设置</CardTitle><p>设备、启动和通知行为</p></div>
       <SettingRow icon={Router} title="当前设备" detail="原型使用示例设备信息"><Badge tone="blue">Android Root</Badge></SettingRow>
       <SettingRow icon={Bell} title="通知与状态" detail="实际实现将显示经 Core 确认的运行状态"><Badge tone="neutral">仅演示</Badge></SettingRow>
       <SettingRow icon={SlidersHorizontal} title="界面语言" detail="跟随系统或选择显示语言"><span className="setting-value">简体中文</span></SettingRow>
       <SettingRow icon={Database} title="配置版本" detail="本地演示配置修订序号"><Badge tone="blue">Revision {revision}</Badge></SettingRow>
     </Card>}
     {section==='engine'&&<Card><div className="settings-heading"><CardTitle>内核与接管</CardTitle><p>根据真实平台能力显示可用选项</p></div>
       <SettingRow icon={Terminal} title="sing-box 运行时" detail="连接状态与控制权限从 Go Core 获取"><Badge tone="amber">{demoRunning?'Running · 模拟':'Stopped · 模拟'}</Badge></SettingRow>
       <SettingRow icon={Wifi} title="网络接管方式" detail="Root、TUN、VPN 等由宿主能力决定"><span className="setting-value">TUN / eBPF（模拟）</span></SettingRow>
       <SettingRow icon={Wrench} title="诊断与日志" detail="服务、API、DNS 与路由健康检查"><Button size="sm" variant="outline" onClick={()=>show('演示：暂无连接中的 Go Core，不能实际读取诊断')}>查看诊断</Button></SettingRow>
     </Card>}
     {section==='dns'&&<Card><div className="settings-heading"><CardTitle>DNS 与网络</CardTitle><p>这是统一原生 JSON 的一部分</p></div>
       <SettingRow icon={Wifi} title="DNS 服务" detail="从 sing-box DNS 配置读取"><Badge tone="neutral">见原生 JSON</Badge></SettingRow>
       <SettingRow icon={Monitor} title="IPv6 与系统代理" detail="由当前 Host 能力和配置决定"><span className="setting-value">待 Core 接入</span></SettingRow>
       <div className="inline-info"><Info size={16}/> 没有第二套 DNS 配置模式；在原生配置中修改与在图形表单中修改，最终操作同一份文档。</div>
     </Card>}
     {section==='config'&&<Card className="editor-card"><div className="section-head"><div><CardTitle>原生 sing-box JSON</CardTitle><p>唯一配置事实源 · 演示版本 revision {revision}</p></div><Badge tone="blue">可编辑</Badge></div>
       <div className="editor-notice"><AlertTriangle size={17}/> 演示编辑器只做 JSON 语法及简化 Schema 校验。真实 sing-box 校验、注释保留、未知字段、版本冲突及运行时应用尚未实现。</div>
       <textarea spellCheck={false} className="json-editor" value={raw} onChange={e=>{setRaw(e.target.value);setError('')}} aria-label="编辑原生 JSON"/>
       {error&&<p className="field-error json-error">{error}</p>}
       <div className="editor-actions"><Button variant="outline" onClick={format}><Code2 size={16}/> 格式化</Button><Button variant="outline" onClick={download}><Download size={16}/> 导出</Button><Button onClick={save}><Save size={16}/> 应用到演示数据</Button></div>
     </Card>}
     {section==='security'&&<Card><div className="settings-heading"><CardTitle>安全与访问</CardTitle><p>实际授权由 Go Core 与宿主 Broker 负责</p></div>
       <SettingRow icon={LockKeyhole} title="WebUI 身份验证" detail="Core API 权限与浏览器 Origin 检查"><Badge tone="amber">演示无真实鉴权</Badge></SettingRow>
       <SettingRow icon={Shield} title="原生操作权限" detail="React 页面不会调用 Root Shell 或 Tauri 高权限命令"><Badge tone="green">隔离设计</Badge></SettingRow>
       <SettingRow icon={Clipboard} title="服务凭据" detail="真实引擎密钥不能泄露给页面"><span className="setting-value">未连接</span></SettingRow>
     </Card>}
     {section==='appearance'&&<Card><div className="settings-heading"><CardTitle>外观</CardTitle><p>基于 NiPath UI Tokens 的统一主题</p></div>
       <SettingRow icon={theme==='light'?Sun:Moon} title="颜色主题" detail="切换亮色 / 暗色界面"><div className="theme-buttons"><button className={theme==='light'?'selected':''} onClick={()=>setTheme('light')}><Sun size={15}/> 亮色</button><button className={theme==='dark'?'selected':''} onClick={()=>setTheme('dark')}><Moon size={15}/> 暗色</button></div></SettingRow>
       <SettingRow icon={Monitor} title="响应式页面" detail="桌面侧栏与移动端底部导航"><Badge tone="green">已实现</Badge></SettingRow>
     </Card>}
     {section==='about'&&<Card><div className="about-brand"><span className="brand-logo">N</span><div><h2>NiPath 1.0</h2><p>奶屁 · NP</p></div></div><p className="about-description">跨平台代理与网络流量管理工具。该 WebUI 是 React 组件化开发预览，并非可接管网络的正式版客户端。</p>
       <div className="about-row"><b>技术栈</b><span>React · TypeScript · Vite · Tailwind · Radix / shadcn/ui</span></div>
       <div className="about-row"><b>配置理念</b><span>一份原生配置，一套统一界面</span></div>
       <div className="about-row"><b>源码</b><a href="https://github.com/Fanju6/NiPath-Architecture/tree/main/web" target="_blank" rel="noreferrer">GitHub /web ↗</a></div>
       <div className="about-row"><b>构建方式</b><span>GitHub Actions → /docs → GitHub Pages</span></div>
       <div className="inline-info"><CheckCircle2 size={16}/> 页面原型可操作、组件状态可联动；真实 Core 集成仍须后续实现。</div>
     </Card>}
    </div>
  </div>
 </div>
}
