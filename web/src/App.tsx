import { Shell } from './components/shell'
import { OverviewPage } from './pages/overview'
import { ProxiesPage } from './pages/proxies'
import { ResourcesPage } from './pages/resources'
import { RulesPage } from './pages/rules'
import { SettingsPage } from './pages/settings'
import { useUI } from './store/use-ui'

export default function App() {
 const page=useUI(s=>s.page)
 return <Shell>
  {page==='overview'&&<OverviewPage/>}
  {page==='proxies'&&<ProxiesPage/>}
  {page==='resources'&&<ResourcesPage/>}
  {page==='rules'&&<RulesPage/>}
  {page==='settings'&&<SettingsPage/>}
 </Shell>
}
