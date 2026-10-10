import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { configSchema, type Config, type Group, type Node, type Rule, type Source } from '../lib/demo'
import { controlCore, getCoreConfig, getCoreStatus, refreshSubscription, selectGroupNode, testGroup, validateCoreConfig, putCoreConfig } from '../lib/core-api'

export type Page = 'overview'|'proxies'|'resources'|'rules'|'settings'
type Runtime = 'disconnected'|'ready'|'stopped'|'loading'
type UIState = {
  page: Page
  theme:'light'|'dark'
  config: Config
  revision: number
  coreRevision: string|null
  coreConnected: boolean
  runtime: Runtime
  selectedGroup:string
  demoRunning:boolean
  selected:Record<string,string>
  nodes:Node[]
  sources:Source[]
  notice:string|null
  busy:boolean
  downloadRate:number
  uploadRate:number
  activeConnections:number|null
  setPage:(p:Page)=>void
  setTheme:(t:'light'|'dark')=>void
  show:(s:string)=>void
  clearNotice:()=>void
  checkCore:()=>Promise<void>
  loadCoreConfig:()=>Promise<void>
  applyConfig:()=>Promise<boolean>
  selectGroup:(s:string)=>void
  selectNode:(group:string,node:string)=>Promise<void>
  testGroup:(group:string)=>Promise<void>
  setRunning:(v:boolean)=>Promise<void>
  addGroup:(g:Group)=>void
  updateGroup:(tag:string,g:Group)=>void
  removeGroup:(tag:string)=>void
  addSource:(name:string,url:string)=>void
  updateSource:(id:string,name:string,url:string)=>void
  removeSource:(id:string)=>void
  refreshSource:(id:string)=>Promise<void>
  addNode:(n:Node)=>void
  updateNode:(tag:string,node:Node)=>void
  removeNode:(tag:string)=>void
  addRule:(r:Rule)=>void
  updateRule:(id:string,rule:Rule)=>void
  moveRule:(id:string,direction:-1|1)=>void
  toggleRule:(id:string)=>void
  removeRule:(id:string)=>void
  setRawConfig:(raw:string)=>{ok:boolean;error?:string}
  resetDrafts:()=>void
}

const emptyConfig:Config = { log:{level:'info'}, outbounds:[], route:{rules:[]}, dns:{servers:[]} }
const reason=(e:unknown)=>e instanceof Error?e.message:'未知错误'
const hasStatus=(v:unknown):v is {running?:boolean;ready?:boolean;state?:string;traffic?:{upload_rate?:number;download_rate?:number;connections?:number}}=>
  !!v && typeof v==='object' && ('running' in v || 'ready' in v || 'state' in v)
const initial:Pick<UIState,'config'|'sources'|'nodes'|'selected'|'revision'>={
  config:emptyConfig,sources:[],nodes:[],selected:{},revision:0,
}

export const useUI = create<UIState>()(persist((set,get)=>({
  page:'overview',theme:'light',...initial,coreRevision:null,coreConnected:false,
  runtime:'disconnected',selectedGroup:'',demoRunning:false,
  notice:null,busy:false,downloadRate:0,uploadRate:0,activeConnections:null,
  setPage:page=>set({page}),
  setTheme:theme=>set({theme}),
  show:notice=>set({notice}),
  clearNotice:()=>set({notice:null}),
  checkCore:async()=>{
    try{
      const data=await getCoreStatus()
      if(!hasStatus(data))throw new Error('Core 状态响应缺少必要字段')
      const running=data.running===true||data.ready===true||data.state==='running'||data.state==='ready'
      set({coreConnected:true,runtime:running?'ready':'stopped',demoRunning:running,
        downloadRate:running?(data.traffic?.download_rate??0):0,
        uploadRate:running?(data.traffic?.upload_rate??0):0,
        activeConnections:running?(data.traffic?.connections??null):0})
    }catch{
      set({coreConnected:false,runtime:'disconnected',demoRunning:false,
        downloadRate:0,uploadRate:0,activeConnections:null})
    }
  },
  loadCoreConfig:async()=>{
    if(!get().coreConnected){get().show('NiPath Core 未连接，无法读取设备配置');return}
    try{
      const data=await getCoreConfig()
      const raw=data.source??data.config
      const parsed=configSchema.safeParse(typeof raw==='string'?JSON.parse(raw):raw)
      if(!parsed.success)throw new Error('设备配置包含当前前端尚未支持的结构，请使用原生 JSON 模式')
      set({config:parsed.data,coreRevision:data.etag||String(data.revision??''),revision:get().revision+1,notice:'已从 Core 同步配置'})
    }catch(e){get().show(reason(e))}
  },
  applyConfig:async()=>{
    const state=get()
    if(!state.coreConnected||!state.coreRevision){state.show('Core 未连接或缺少配置修订版本，无法应用');return false}
    set({busy:true})
    try{
      await validateCoreConfig(state.config)
      const data=await putCoreConfig(state.config,state.coreRevision)
      set({coreRevision:data.etag||String(data.revision??state.coreRevision),notice:'设备配置已通过 Core 校验并保存'})
      return true
    }catch(e){get().show(reason(e));return false}
    finally{set({busy:false})}
  },
  selectGroup:selectedGroup=>set({selectedGroup}),
  selectNode:async(group,node)=>{
    if(!get().coreConnected){get().show('Core 未连接，无法切换实际出口');return}
    try{await selectGroupNode(group,node);set(s=>({selected:{...s.selected,[group]:node},notice:'已提交节点选择'}))}
    catch(e){get().show(reason(e))}
  },
  testGroup:async(group)=>{
    if(!get().coreConnected){get().show('Core 未连接，无法执行节点测速');return}
    try{await testGroup(group);get().show('已开始测速，请等待引擎返回结果')}
    catch(e){get().show(reason(e))}
  },
  setRunning:async(v)=>{
    if(!get().coreConnected){get().show('Core 未连接，代理控制不可用');return}
    set({busy:true})
    try{
      const data=await controlCore(v)
      const running=data.running===true||data.ready===true||data.state==='running'||data.state==='ready'
      set({demoRunning:running,runtime:running?'ready':'stopped',notice:running?'代理已启动':'代理已停止'})
    }catch(e){get().show(reason(e))}
    finally{set({busy:false})}
  },
  addGroup:g=>{
    const s=get()
    if(s.config.outbounds.some(x=>x.tag===g.tag)){s.show('策略组 tag 已存在');return}
    set({config:{...s.config,outbounds:[...s.config.outbounds,g]},revision:s.revision+1,selectedGroup:g.tag,notice:'策略组已保存到本地配置草稿'})
  },
  updateGroup:(tag,g)=>{
    if(tag!==g.tag&&get().config.outbounds.some(x=>x.tag===g.tag)){get().show('策略组 tag 已存在');return}
    set(s=>({config:{...s.config,outbounds:s.config.outbounds.map(x=>x.tag===tag?g:x)},revision:s.revision+1,selectedGroup:g.tag,notice:'策略组已更新（尚未应用）'}))
  },
  removeGroup:tag=>{
    const s=get()
    const used=s.config.outbounds.some(g=>g.tag!==tag&&g.outbounds.includes(tag))||s.config.route.rules.some(r=>r.outbound===tag)
    if(used){s.show('策略组仍被其他策略组或路由规则引用，无法删除');return}
    set({config:{...s.config,outbounds:s.config.outbounds.filter(g=>g.tag!==tag)},revision:s.revision+1,selectedGroup:'',notice:'已从配置草稿移除策略组'})
  },
  addSource:(name,url)=>set(s=>({sources:[...s.sources,{id:crypto.randomUUID(),name,url,count:0,updated:'尚未同步',traffic:'未提供',status:'pending'}],notice:'订阅来源已保存；同步需要 Core'})),
  updateSource:(id,name,url)=>set(s=>({sources:s.sources.map(x=>x.id===id?{...x,name,url}:x),notice:'订阅来源已更新'})),
  removeSource:id=>set(s=>({sources:s.sources.filter(x=>x.id!==id),nodes:s.nodes.filter(x=>x.source!==s.sources.find(y=>y.id===id)?.name),notice:'来源已从工作区移除'})),
  refreshSource:async id=>{
    if(!get().coreConnected){get().show('Core 未连接，无法同步订阅');return}
    try{
      await refreshSubscription(id)
      set(s=>({sources:s.sources.map(x=>x.id===id?{...x,status:'pending',updated:'等待内核确认'}:x),notice:'已提交订阅刷新任务'}))
    }catch(e){get().show(reason(e))}
  },
  addNode:n=>{
    if(get().nodes.some(x=>x.tag===n.tag)){get().show('节点 tag 已存在');return}
    set(s=>({nodes:[...s.nodes,n],notice:'已添加本地节点资料'}))
  },
  updateNode:(tag,node)=>set(s=>({nodes:s.nodes.map(n=>n.tag===tag?node:n),notice:'节点资料已更新'})),
  removeNode:tag=>{
    const s=get()
    if(s.config.outbounds.some(g=>g.outbounds.includes(tag))){s.show('节点被策略组引用，无法删除');return}
    set({nodes:s.nodes.filter(n=>n.tag!==tag),notice:'节点已删除'})
  },
  addRule:r=>set(s=>({config:{...s.config,route:{...s.config.route,rules:[...s.config.route.rules,r]}},revision:s.revision+1,notice:'路由规则已保存到配置草稿'})),
  updateRule:(id,r)=>set(s=>({config:{...s.config,route:{...s.config.route,rules:s.config.route.rules.map(x=>x.id===id?r:x)}},revision:s.revision+1,notice:'规则已更新'})),
  moveRule:(id,direction)=>set(s=>{
    const rules=[...s.config.route.rules],i=rules.findIndex(x=>x.id===id),next=i+direction
    if(i<0||next<0||next>=rules.length)return {}
    ;[rules[i],rules[next]]=[rules[next],rules[i]]
    return {config:{...s.config,route:{...s.config.route,rules}},revision:s.revision+1}
  }),
  toggleRule:id=>set(s=>({config:{...s.config,route:{...s.config.route,rules:s.config.route.rules.map(r=>r.id===id?{...r,enabled:!r.enabled}:r)}},revision:s.revision+1})),
  removeRule:id=>set(s=>({config:{...s.config,route:{...s.config.route,rules:s.config.route.rules.filter(r=>r.id!==id)}},revision:s.revision+1,notice:'规则已移除'})),
  setRawConfig:raw=>{
    try{
      const parsed=configSchema.parse(JSON.parse(raw))
      const groups=parsed.outbounds.map(g=>g.tag)
      if(new Set(groups).size!==groups.length)return {ok:false,error:'策略组 tag 不可重复'}
      set(s=>({config:parsed,revision:s.revision+1,notice:'配置草稿已更新，应用到设备需经过 Core 校验'}))
      return {ok:true}
    }catch(e){return {ok:false,error:reason(e)}}
  },
  resetDrafts:()=>set(s=>({...initial,theme:s.theme,coreConnected:s.coreConnected,runtime:s.runtime,demoRunning:s.demoRunning,coreRevision:null,notice:'本地草稿已清空'})),
}),{
  name:'nipath-session-workspace-v1',
  storage:createJSONStorage(()=>sessionStorage),
  version:1,
  // URLs and config can contain secrets: never save these to localStorage.
  partialize:s=>({theme:s.theme,config:s.config,revision:s.revision,selected:s.selected,
    nodes:s.nodes,sources:s.sources,selectedGroup:s.selectedGroup}),
}))
