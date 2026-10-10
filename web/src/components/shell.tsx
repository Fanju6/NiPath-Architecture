import { Activity, Boxes, Cable, CircleHelp, Code2, Gauge, Github, LayoutDashboard, Menu, Moon, Router, Settings, ShieldCheck, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTitle } from './ui/sheet'
import { useUI, type Page } from '../store/use-ui'
const nav: {id:Page;label:string;Icon:typeof Gauge}[] = [
  {id:'overview',label:'概览',Icon:LayoutDashboard},
  {id:'proxies',label:'代理',Icon:Cable},
  {id:'resources',label:'资源',Icon:Boxes},
  {id:'rules',label:'规则',Icon:ShieldCheck},
  {id:'settings',label:'设置',Icon:Settings},
]
export function Shell({children}:{children:React.ReactNode}) {
 const {page,setPage,theme,setTheme,demoRunning,notice,clearNotice}=useUI()
 const [menuOpen,setMenuOpen]=useState(false)
 useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark')},[theme])
 const choose=(p:Page)=>{setPage(p);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'})}
 return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">N</span><div><div className="brand-name">NiPath <span>1.0</span></div><div className="brand-subtitle">奶屁 · NP</div></div>
      </div>
      <div className="sidebar-group-label">工作区</div>
      <nav aria-label="主导航" className="side-nav">
        {nav.map(({id,label,Icon})=><button key={id} className={'nav-link '+(page===id?'active':'')} onClick={()=>choose(id)} aria-current={page===id?'page':undefined}><Icon size={19}/>{label}{page===id&&<span className="nav-dot"/>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-panel"><span className="help-icon"><CircleHelp size={18}/></span><div><strong>NiPath WebUI</strong><small>React 开发预览 · 1.0</small></div></div>
        <div className="sidebar-status"><span className="status-dot"/> {demoRunning?'演示：代理已连接':'演示：代理已停止'}<small>仅本地模拟</small></div>
      </div>
    </aside>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="mobile-sheet">
        <SheetTitle className="sr-only">NiPath 主导航</SheetTitle>
        <div className="brand">
          <span className="brand-logo">N</span>
          <div><div className="brand-name">NiPath <span>1.0</span></div><div className="brand-subtitle">奶屁 · NP</div></div>
        </div>
        <div className="sidebar-group-label">工作区</div>
        <nav aria-label="手机侧栏导航" className="side-nav">
          {nav.map(({id,label,Icon})=><button key={id} className={'nav-link '+(page===id?'active':'')} onClick={()=>choose(id)} aria-current={page===id?'page':undefined}><Icon size={19}/>{label}{page===id&&<span className="nav-dot"/>}</button>)}
        </nav>
        <div className="sidebar-status mt-auto"><span className="status-dot"/> {demoRunning?'演示：代理已连接':'演示：代理已停止'}</div>
      </SheetContent>
    </Sheet>
    <div className="main-column">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="打开菜单"><Menu size={22}/></button><span className="crumb-home">NiPath</span><span className="crumb-divider">/</span><strong>{nav.find(n=>n.id===page)?.label}</strong></div>
        <div className="topbar-right"><span className="demo-tag"><Activity size={13}/> 在线演示</span><span className="desktop-device"><Router size={15}/> Android · Root</span>
          <Button variant="ghost" size="icon" aria-label="切换明暗主题" onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</Button>
          <a className="github-top" href="https://github.com/Fanju6/NiPath-Architecture" target="_blank" rel="noreferrer" aria-label="GitHub 仓库"><Github size={18}/></a>
        </div>
      </header>
      <div className="demo-banner"><Code2 size={16}/><span><b>React WebUI 开发演示</b> — 本站展示模拟数据，操作仅改变本地页面，不会连接或修改设备网络。</span></div>
      <main className="main-content">{children}</main>
    </div>
    <nav className="mobile-bottom-nav" aria-label="移动端主导航">
      {nav.map(({id,label,Icon})=><button key={id} className={page===id?'active':''} onClick={()=>choose(id)} aria-current={page===id?'page':undefined}><Icon size={21}/><span>{label}</span></button>)}
    </nav>
    {notice&&<div className="toast" role="status"><span>{notice}</span><button aria-label="关闭提示" onClick={clearNotice}><X size={16}/></button></div>}
  </div>
}
