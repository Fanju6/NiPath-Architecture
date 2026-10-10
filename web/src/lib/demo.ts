import { z } from 'zod'

export const groupTypeSchema = z.enum(['selector','urltest','load-balance'])
export const groupSchema = z.object({
  type: groupTypeSchema, tag: z.string().min(1), outbounds: z.array(z.string()).default([]),
  providers: z.array(z.string()).optional(), include: z.string().optional(), exclude: z.string().optional(),
  default: z.string().optional(), strategy: z.string().optional(), interval: z.string().optional(),
}).passthrough()
export const ruleSchema = z.object({ id: z.string(), match: z.string().min(1), outbound: z.string().min(1), enabled: z.boolean() }).passthrough()
export const configSchema = z.object({
  log: z.record(z.unknown()).optional(),
  outbounds: z.array(groupSchema),
  route: z.object({ rules: z.array(ruleSchema) }).passthrough(),
  dns: z.record(z.unknown()).optional(),
}).passthrough()
export type Group = z.infer<typeof groupSchema>
export type Rule = z.infer<typeof ruleSchema>
export type Config = z.infer<typeof configSchema>
export type Source = { id: string; name: string; url: string; count: number; updated: string; traffic: string; status:'applied'|'pending'|'failed' }
export type Node = { tag: string; name: string; source: string; protocol: string; latency: number|null; flag:string; address:string }
export const demoNodes: Node[] = [
 {tag:'sub-1/us-los-angeles-01',name:'Los Angeles 01',source:'Cloud Premium',protocol:'Shadowsocks · TLS',latency:58,flag:'🇺🇸',address:'us01.example.com:443'},
 {tag:'sub-1/jp-tokyo-03',name:'Tokyo 03',source:'Cloud Premium',protocol:'VLESS · Reality',latency:86,flag:'🇯🇵',address:'jp03.example.com:443'},
 {tag:'sub-1/hk-hongkong-02',name:'Hong Kong 02',source:'Cloud Premium',protocol:'Hysteria2',latency:42,flag:'🇭🇰',address:'hk02.example.com:8443'},
 {tag:'sub-2/us-seattle-05',name:'Seattle 05',source:'Global Nodes',protocol:'Trojan',latency:123,flag:'🇺🇸',address:'us05.example.com:443'},
 {tag:'sub-2/sg-singapore-01',name:'Singapore 01',source:'Global Nodes',protocol:'TUIC',latency:97,flag:'🇸🇬',address:'sg01.example.com:443'},
 {tag:'local/development',name:'Development',source:'本地节点',protocol:'Shadowsocks',latency:null,flag:'🧩',address:'127.0.0.1:1080'},
]
export const initialSources: Source[] = [
 {id:'sub-1',name:'Cloud Premium',url:'https://example.com/sub/cloud',count:86,updated:'2 分钟前',traffic:'28.5 / 100 GB',status:'applied'},
 {id:'sub-2',name:'Global Nodes',url:'https://example.com/sub/global',count:64,updated:'1 小时前',traffic:'12.8 / 50 GB',status:'applied'},
 {id:'sub-3',name:'Backup Network',url:'https://example.com/sub/backup',count:6,updated:'昨天',traffic:'未提供',status:'pending'},
]
export const initialConfig: Config = {
  log:{level:'info'},dns:{servers:[]},
  outbounds:[
    {type:'selector',tag:'默认代理',outbounds:['sub-1/us-los-angeles-01','sub-1/jp-tokyo-03','香港节点','自动选择','direct'],default:'sub-1/us-los-angeles-01'},
    {type:'urltest',tag:'自动选择',outbounds:['sub-1/hk-hongkong-02','sub-1/jp-tokyo-03','sub-2/sg-singapore-01'],interval:'3m'},
    {type:'selector',tag:'美国节点',outbounds:['sub-1/us-los-angeles-01','sub-2/us-seattle-05']},
    {type:'selector',tag:'香港节点',outbounds:['sub-1/hk-hongkong-02','direct']},
    {type:'load-balance',tag:'全球均衡',outbounds:['sub-1/us-los-angeles-01','sub-1/jp-tokyo-03','sub-2/sg-singapore-01'],strategy:'consistent-hashing'},
  ],
  route:{rules:[
    {id:'r1',match:'domain_suffix: openai.com',outbound:'美国节点',enabled:true},
    {id:'r2',match:'domain_suffix: github.com',outbound:'默认代理',enabled:true},
    {id:'r3',match:'geosite: cn',outbound:'direct',enabled:true},
    {id:'r4',match:'final',outbound:'默认代理',enabled:true},
  ]},
}
export function latencyText(n: number|null){ return n === null ? '未测速' : n + ' ms' }
export const recentConnections = [
 {name:'www.google.com',type:'TLS · 443',time:'32 ms',icon:'🌐'},
 {name:'api.openai.com',type:'TLS · 443',time:'28 ms',icon:'✨'},
 {name:'github.com',type:'TLS · 443',time:'52 ms',icon:'🐙'},
 {name:'www.youtube.com',type:'HTTPS · 443',time:'65 ms',icon:'▶️'},
]
