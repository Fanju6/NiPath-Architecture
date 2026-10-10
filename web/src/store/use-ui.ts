import { create } from 'zustand'
import { configSchema, demoNodes, initialConfig, initialSources, type Config, type Group, type Node, type Rule, type Source } from '../lib/demo'

export type Page = 'overview'|'proxies'|'resources'|'rules'|'settings'
type UIState = {
  page: Page; theme: 'light'|'dark'; config: Config; revision: number; selectedGroup: string; demoRunning: boolean;
  selected: Record<string,string>; nodes: Node[]; sources: Source[]; notice: string|null;
  setPage:(p:Page)=>void; setTheme:(t:'light'|'dark')=>void; show:(s:string)=>void; clearNotice:()=>void;
  selectGroup:(s:string)=>void; selectNode:(group:string,node:string)=>void;
  setRunning:(v:boolean)=>void; addGroup:(g:Group)=>void; removeGroup:(tag:string)=>void;
  addSource:(name:string,url:string)=>void; refreshSource:(id:string)=>void;
  addRule:(r:Rule)=>void; toggleRule:(id:string)=>void; removeRule:(id:string)=>void;
  setRawConfig:(raw:string)=>{ok:boolean;error?:string};
}
export const useUI = create<UIState>((set,get)=>({
  page:'overview',theme:'light',config:initialConfig,revision:1,selectedGroup:'默认代理',demoRunning:true,
  selected:{'默认代理':'sub-1/us-los-angeles-01','美国节点':'sub-1/us-los-angeles-01','香港节点':'sub-1/hk-hongkong-02'},
  nodes:demoNodes,sources:initialSources,notice:null,
  setPage:page=>set({page}),
  setTheme:theme=>set({theme}),
  show:notice=>set({notice}),
  clearNotice:()=>set({notice:null}),
  selectGroup:selectedGroup=>set({selectedGroup}),
  selectNode:(group,node)=>set({selected:{...get().selected,[group]:node},notice:'演示：策略组已切换，未发送到真实内核'}),
  setRunning:demoRunning=>set({demoRunning,notice:'演示：仅改变本地状态，未启动或停止真实代理'}),
  addGroup:group=>set(s=>({config:{...s.config,outbounds:[...s.config.outbounds,group]},revision:s.revision+1,selectedGroup:group.tag,notice:'演示：策略组已加入同一份 JSON 配置'})),
  removeGroup:tag=>set(s=>({config:{...s.config,outbounds:s.config.outbounds.filter(g=>g.tag!==tag)},revision:s.revision+1,selectedGroup:'默认代理',notice:'演示：已从原生配置移除策略组'})),
  addSource:(name,url)=>set(s=>({sources:[...s.sources,{id:'source-'+Date.now(),name,url,count:0,updated:'尚未同步',traffic:'未知',status:'pending'}],notice:'演示：仅加入本地资源列表；没有访问订阅 URL'})),
  refreshSource:id=>set(s=>({sources:s.sources.map(v=>v.id===id?{...v,updated:'刚刚（演示）',status:'pending'}:v),notice:'演示：没有发起实际订阅下载；内核尚未确认生效'})),
  addRule:r=>set(s=>({config:{...s.config,route:{...s.config.route,rules:[...s.config.route.rules,r]}},revision:s.revision+1,notice:'演示：规则已写入原生 JSON'})),
  toggleRule:id=>set(s=>({config:{...s.config,route:{...s.config.route,rules:s.config.route.rules.map(r=>r.id===id?{...r,enabled:!r.enabled}:r)}},revision:s.revision+1})),
  removeRule:id=>set(s=>({config:{...s.config,route:{...s.config.route,rules:s.config.route.rules.filter(r=>r.id!==id)}},revision:s.revision+1})),
  setRawConfig:raw=>{
    try {
      const parsed=configSchema.parse(JSON.parse(raw))
      const groups=parsed.outbounds.map(g=>g.tag)
      if(new Set(groups).size!==groups.length) return {ok:false,error:'存在重复的策略组 tag'}
      set(s=>({config:parsed,revision:s.revision+1,notice:'演示：JSON 通过基础 Schema 校验并应用到本地数据；未应用至内核'}))
      return {ok:true}
    } catch(e){return {ok:false,error:e instanceof Error?e.message:'未知 JSON 错误'}}
  },
}))
