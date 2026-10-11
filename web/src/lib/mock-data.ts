import type { Config, Node, Source } from './model'

/** Explicit preview fixtures, never injected into a connected Core session. */
export const mockNodes: Node[] = [
 {tag:'sub-1/us-la',name:'洛杉矶 01',source:'Aurora Premium',protocol:'VLESS · Reality',latency:85,flag:'🇺🇸',address:'us01.example.net:443'},
 {tag:'sub-1/jp-tokyo',name:'东京 02',source:'Aurora Premium',protocol:'Hysteria2',latency:112,flag:'🇯🇵',address:'jp02.example.net:443'},
 {tag:'sub-1/hk',name:'香港 01',source:'Aurora Premium',protocol:'AnyTLS',latency:38,flag:'🇭🇰',address:'hk01.example.net:443'},
 {tag:'sub-2/sg',name:'新加坡 03',source:'Global Network',protocol:'Trojan',latency:76,flag:'🇸🇬',address:'sg03.example.net:443'},
 {tag:'sub-2/de',name:'法兰克福 01',source:'Global Network',protocol:'VLESS · Reality',latency:182,flag:'🇩🇪',address:'de01.example.net:443'},
 {tag:'local/test',name:'本地测试节点',source:'本地节点',protocol:'Shadowsocks',latency:null,flag:'🧩',address:'127.0.0.1:8388'},
]
export const mockSources: Source[] = [
 {id:'sub-1',name:'Aurora Premium',url:'https://example.net/subscription/aurora',count:3,updated:'10 分钟前',traffic:'24.8 / 100 GB',status:'applied'},
 {id:'sub-2',name:'Global Network',url:'https://example.net/subscription/global',count:2,updated:'1 小时前',traffic:'8.2 / 50 GB',status:'applied'},
 {id:'sub-3',name:'Backup',url:'https://example.net/subscription/backup',count:0,updated:'尚未同步',traffic:'未提供',status:'pending'},
]
export const mockConfig: Config = {
 log:{level:'info'},dns:{servers:[]},
 outbounds:[
 {type:'selector',tag:'默认代理',outbounds:['自动选择','香港节点','美国节点','direct'],default:'自动选择'},
 {type:'urltest',tag:'自动选择',outbounds:['sub-1/us-la','sub-1/jp-tokyo','sub-1/hk','sub-2/sg'],interval:'3m'},
 {type:'selector',tag:'香港节点',outbounds:['sub-1/hk','direct'],default:'sub-1/hk'},
 {type:'selector',tag:'美国节点',outbounds:['sub-1/us-la','sub-2/de'],default:'sub-1/us-la'},
 {type:'load-balance',tag:'全球均衡',outbounds:['sub-1/us-la','sub-1/jp-tokyo','sub-2/sg'],strategy:'consistent-hashing'},
 ],
 route:{rules:[
  {id:'rule-1',match:'domain_suffix: openai.com',outbound:'美国节点',enabled:true},
  {id:'rule-2',match:'domain_suffix: github.com',outbound:'默认代理',enabled:true},
  {id:'rule-3',match:'domain_suffix: youtube.com',outbound:'自动选择',enabled:true},
  {id:'rule-4',match:'geoip: private',outbound:'direct',enabled:true},
  {id:'rule-5',match:'final',outbound:'默认代理',enabled:true},
 ]},
}
export const mockSelected:Record<string,string> = {
 '默认代理':'自动选择','香港节点':'sub-1/hk','美国节点':'sub-1/us-la'
}
export function usePreviewFixtures() {
 if (typeof window === 'undefined') return false
 const host=window.location.hostname
 return host==='fanju6.github.io'||host==='localhost'||host==='127.0.0.1'
}
