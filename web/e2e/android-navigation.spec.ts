import { test, expect } from '@playwright/test'

test('Android: bottom navigation survives all five destinations and detail back', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'android-phone')
  await page.goto('/')
  const shell = page.getByTestId('android-shell')
  const nav = page.getByRole('navigation', { name: '底部主导航' })
  await expect(shell).toBeVisible()
  await expect(nav).toBeVisible()
  await expect(nav.locator('button')).toHaveCount(5)
  await expect(page.getByTestId('android-shell')).toHaveClass(/bg-background/)
  await expect(nav.getByRole('button', { name: '概览' })).toHaveAttribute('aria-current', 'page')
  // Primary screens have exactly one heading in the shared app bar, not a
  // separate web-style heading at the top of their content.
  await expect(page.getByRole('heading', { name: '概览', exact: true })).toHaveCount(1)
  // The app bar is a page-level native affordance: no product logo,
  // website-style NiPath label, or redundant DEMO badge.
  const appBar = page.getByTestId('mobile-app-bar')
  await expect(appBar.locator('svg')).toHaveCount(0) // overview has no contextual toolbar action
  await expect(appBar.getByText('NiPath', { exact: true })).toHaveCount(0)
  await expect(appBar.getByText('DEMO', { exact: true })).toHaveCount(0)
  await expect(appBar.getByRole('heading', { name: '概览' })).toHaveCount(1)
  await expect(page.getByTestId('mobile-expanded-title')).toBeVisible()
  await expect(page.getByTestId('mobile-collapsed-title')).toHaveCount(0)
  const content = page.locator('main')
  await content.evaluate(node => { node.scrollTop = 120 })
  await expect(page.getByTestId('mobile-collapsed-title')).toHaveText('概览')
  await expect(page.getByTestId('mobile-expanded-title')).toHaveCount(0)
  await content.evaluate(node => { node.scrollTop = 0 })
  await expect(page.getByTestId('mobile-expanded-title')).toBeVisible()
  await page.screenshot({ path: 'test-results/nipath-android-overview.png', fullPage: true })

  await nav.getByRole('button', { name: '代理' }).click()
  await expect(page.getByTestId('mobile-app-bar').getByRole('button', { name: '添加策略组' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '代理', exact: true })).toHaveCount(1)
  await expect(nav.getByRole('button', { name: '代理' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('button', { name: /默认代理/ }).click()
  await expect(page.getByTestId('mobile-detail-title')).toHaveText('默认代理')
  await expect(page.getByRole('heading', { name: '默认代理', exact: true })).toHaveCount(0)
  await expect(nav).toHaveCount(0) // Native Android navigation hierarchy: detail replaces root tabs
  await page.getByRole('button', { name: '返回' }).click()
  await expect(nav).toBeVisible()

  await nav.getByRole('button', { name: '资源' }).click()
  await expect(page.getByTestId('mobile-app-bar').getByRole('button', { name: '添加订阅' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '资源', exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: '添加订阅' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: '添加订阅' })).toBeVisible()
  await page.getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await nav.getByRole('button', { name: '规则' }).click()
  await expect(page.getByTestId('mobile-app-bar').getByRole('button', { name: '新增路由规则' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '规则', exact: true })).toHaveCount(1)
  await nav.getByRole('button', { name: '设置' }).click()
  await expect(page.getByRole('heading', { name: '设置', exact: true })).toHaveCount(1)
  await page.getByRole('switch', { name: '深色主题' }).click()
  await expect(page.getByTestId('android-shell')).toHaveAttribute('data-mobile-theme', 'dark')
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('button', { name: '设置' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('[data-testid="android-shell"]')).not.toHaveAttribute('class', /a-dark|material/i)

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(horizontalOverflow).toBe(false)
})

test('Desktop: native mobile navigation never replaces shadcn dashboard Sidebar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('/')
  await expect(page.getByTestId('android-shell')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: '底部主导航' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '概览', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '代理', exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/nipath-desktop.png', fullPage: true })
})
