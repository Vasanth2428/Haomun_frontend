import { test, expect } from '@playwright/test'

test('landing page has title and CTA', async ({ page }) => {
  await page.goto('/')
  
  // Check for brand name
  await expect(page.locator('h1')).toContainText('HaoMun')
  
  // Check for CTA
  await expect(page.getByRole('link', { name: /Forge your destiny/i })).toBeVisible()
})

test('navigation to login works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Login/i }).click()
  await expect(page).toHaveURL(/\/login/)
})
