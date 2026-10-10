import { Suspense, lazy } from 'react'
import { Shell } from './components/shell'
import { Skeleton } from './components/ui/skeleton'
import { useUI } from './store/use-ui'

// Each route is a separate Vite chunk. The Core adapter can be connected later.
const OverviewPage = lazy(() => import('./pages/overview').then(mod => ({ default: mod.OverviewPage })))
const ProxiesPage = lazy(() => import('./pages/proxies').then(mod => ({ default: mod.ProxiesPage })))
const ResourcesPage = lazy(() => import('./pages/resources').then(mod => ({ default: mod.ResourcesPage })))
const RulesPage = lazy(() => import('./pages/rules').then(mod => ({ default: mod.RulesPage })))
const SettingsPage = lazy(() => import('./pages/settings').then(mod => ({ default: mod.SettingsPage })))

function PageSkeleton() {
  return (
    <div className="page" role="status" aria-label="正在加载页面">
      <Skeleton className="mb-5 h-9 w-40" />
      <Skeleton className="mb-4 h-32 w-full" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function App() {
  const page = useUI(s => s.page)
  return (
    <Shell>
      <Suspense fallback={<PageSkeleton />}>
        {page === 'overview' && <OverviewPage />}
        {page === 'proxies' && <ProxiesPage />}
        {page === 'resources' && <ResourcesPage />}
        {page === 'rules' && <RulesPage />}
        {page === 'settings' && <SettingsPage />}
      </Suspense>
    </Shell>
  )
}
