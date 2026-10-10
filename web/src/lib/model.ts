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
export function latencyText(n:number|null){return n===null?'未测速':n+' ms'}
