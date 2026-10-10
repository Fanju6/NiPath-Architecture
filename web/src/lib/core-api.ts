/**
 * NiPath management API client.
 *
 * Intentionally speaks only to a trusted same-origin Core (the future Go
 * embedded WebUI). On GitHub Pages the API is absent: fail closed.
 * No arbitrary remote proxy targets, credentials in query strings, or
 * simulated success fallbacks.
 *
 * Endpoints follow NiPath ARCHITECTURE.md §§5 and 7.
 */
export class CoreUnavailableError extends Error {
  constructor(message = 'NiPath Core 未连接，操作未执行') {
    super(message)
    this.name = 'CoreUnavailableError'
  }
}
const timeoutMs = 10_000
export async function coreRequest<T>(path: string, method = 'GET', body?: unknown, etag?: string): Promise<T> {
  if (!path.startsWith('/api/') || path.includes('//')) throw new Error('无效的 Core API 路径')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (etag) headers['If-Match'] = etag
    const response = await fetch(path, {
      method, credentials: 'same-origin', headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal, cache: 'no-store',
    })
    if (response.status === 404 || response.status === 502 || response.status === 503) throw new CoreUnavailableError()
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('未授权访问 Core，请完成登录')
      if (response.status === 409 || response.status === 412) throw new Error('配置版本冲突，请重新获取最新配置')
      throw new Error('Core 请求失败（HTTP ' + response.status + '）')
    }
    if (response.status === 204) return undefined as T
    const type = response.headers.get('Content-Type') || ''
    if (!type.includes('application/json')) throw new Error('Core 响应格式错误')
    return await response.json() as T
  } catch (error) {
    if (error instanceof CoreUnavailableError) throw error
    if (error instanceof Error && error.name === 'AbortError') throw new CoreUnavailableError('Core 请求超时')
    if (error instanceof TypeError) throw new CoreUnavailableError('无法连接 NiPath Core')
    throw error
  } finally { clearTimeout(timer) }
}
export interface CoreStatus {
  state?: string
  running?: boolean
  ready?: boolean
  generation?: string
  uptime_seconds?: number
  traffic?: { upload_rate?: number; download_rate?: number; connections?: number }
}
export interface ConfigRevision {
  revision?: number | string
  etag?: string
  source?: unknown
  config?: unknown
}
export async function getCoreStatus() {
  return coreRequest<CoreStatus>('/api/runtime/status')
}
export async function controlCore(running: boolean) {
  await coreRequest<unknown>(running ? '/api/runtime/start' : '/api/runtime/stop', 'POST')
  return getCoreStatus()
}
export function testGroup(tag: string) {
  return coreRequest<unknown>('/api/proxies/groups/' + encodeURIComponent(tag) + '/test', 'POST')
}
export function selectGroupNode(tag: string, node: string) {
  return coreRequest<unknown>('/api/proxies/groups/' + encodeURIComponent(tag) + '/select', 'POST', { outbound: node })
}
export function refreshSubscription(id: string) {
  return coreRequest<unknown>('/api/resources/subscriptions/' + encodeURIComponent(id) + '/refresh', 'POST')
}
export async function getCoreConfig() {
  return coreRequest<ConfigRevision>('/api/config/source')
}
export function validateCoreConfig(source: unknown) {
  return coreRequest<unknown>('/api/config/validate', 'POST', { source })
}
export function putCoreConfig(source: unknown, etag: string) {
  return coreRequest<ConfigRevision>('/api/config/source', 'PUT', { source }, etag)
}
