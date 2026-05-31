import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: false })
const page = await browser.newPage()

try {
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')

  // Click FAB to create new note
  await page.click('[aria-label="Create new note"]')
  await page.waitForURL('**/notes/new')

  // Add some content
  await page.fill('input[placeholder="Title"]', 'Test Note')
  await page.fill('textarea[placeholder="Start writing..."]', 'Testing tag selection')

  // Click tag button to open sheet
  await page.click('[aria-label="Manage tags"]')
  await page.waitForTimeout(500)

  // Try to click a tag
  const tagButtons = page.locator('button:has-text("work")')
  const tagCount = await tagButtons.count()
  console.log(`Found ${tagCount} tag buttons`)

  if (tagCount > 0) {
    await tagButtons.first().click()
    await page.waitForTimeout(500)

    // Check if tag badge appears
    const badges = page.locator('[class*="TagBadge"]')
    const badgeCount = await badges.count()
    console.log(`Tag badges after click: ${badgeCount}`)

    if (badgeCount > 0) {
      console.log('✅ Tag selection WORKS')
    } else {
      console.log('❌ Tag selection FAILED - no badge appeared')
    }
  }

  await page.waitForTimeout(2000)
} catch (error) {
  console.error('Error:', error.message)
} finally {
  await browser.close()
}
