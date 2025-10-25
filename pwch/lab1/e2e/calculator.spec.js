import { test, expect } from '@playwright/test'

test.describe('Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear history before each test
    await page.evaluate(() => {
      fetch('http://localhost:8000/history.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })
    })
    await page.reload()
  })

  test('should display calculator interface', async ({ page }) => {
    await expect(page.locator('.calculator')).toBeVisible()
    await expect(page.locator('.display')).toHaveText('0')
    await expect(page.locator('.history-panel')).toBeVisible()
  })

  test('should perform addition calculation', async ({ page }) => {
    await page.click('button:has-text("5")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('8', { timeout: 5000 })
  })

  test('should perform subtraction calculation', async ({ page }) => {
    await page.click('button:has-text("9")')
    await page.click('button:has-text("-")')
    await page.click('button:has-text("4")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('5', { timeout: 5000 })
  })

  test('should perform multiplication calculation', async ({ page }) => {
    await page.click('button:has-text("6")')
    await page.click('button:has-text("*")')
    await page.click('button:has-text("7")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('42', { timeout: 5000 })
  })

  test('should perform division calculation', async ({ page }) => {
    await page.click('button:has-text("8")')
    await page.click('button:has-text("/")')
    await page.click('button:has-text("2")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('4', { timeout: 5000 })
  })

  test('should handle decimal numbers', async ({ page }) => {
    await page.click('button:has-text("3")')
    await page.click('button:has-text(".")')
    await page.click('button:has-text("1")')
    await page.click('button:has-text("4")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("2")')
    await page.click('button:has-text(".")')
    await page.click('button:has-text("8")')
    await page.click('button:has-text("6")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('6', { timeout: 5000 })
  })

  test('should clear display', async ({ page }) => {
    await page.click('button:has-text("5")')
    await page.click('button:has-text("3")')
    await expect(page.locator('.display')).toHaveText('53')

    await page.click('button:has-text("C")')
    await expect(page.locator('.display')).toHaveText('0')
  })

  test('should add calculation to history', async ({ page }) => {
    await page.click('button:has-text("5")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('8', { timeout: 5000 })

    // Wait for history to update
    await page.waitForTimeout(1000)

    const historyItem = page.locator('.history-item').first()
    await expect(historyItem).toBeVisible()
    await expect(historyItem.locator('.expression')).toContainText('5 + 3')
    await expect(historyItem.locator('.result')).toContainText('8')
  })

  test('should display multiple calculations in history', async ({ page }) => {
    // First calculation
    await page.click('button:has-text("5")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')
    await page.waitForTimeout(1000)

    // Second calculation
    await page.click('button:has-text("9")')
    await page.click('button:has-text("-")')
    await page.click('button:has-text("2")')
    await page.click('button:has-text("=")')
    await page.waitForTimeout(1000)

    const historyItems = page.locator('.history-item')
    await expect(historyItems).toHaveCount(2)
  })

  test('should clear history', async ({ page }) => {
    // Add a calculation
    await page.click('button:has-text("5")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')
    await page.waitForTimeout(1000)

    // Verify history has items
    await expect(page.locator('.history-item')).toHaveCount(1)

    // Clear history
    await page.click('button:has-text("Wyczyść")')
    await page.waitForTimeout(500)

    // Verify history is empty
    await expect(page.locator('.empty-history')).toBeVisible()
    await expect(page.locator('.empty-history')).toHaveText('Brak historii')
  })

  test('should load result from history', async ({ page }) => {
    // Add a calculation
    await page.click('button:has-text("7")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')
    await page.waitForTimeout(1000)

    // Clear display
    await page.click('button:has-text("C")')
    await expect(page.locator('.display')).toHaveText('0')

    // Click on history item
    await page.click('.history-item')
    await expect(page.locator('.display')).toHaveText('10')
  })

  test('should perform chain calculations', async ({ page }) => {
    await page.click('button:has-text("2")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("*")')
    await page.click('button:has-text("4")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toHaveText('20', { timeout: 5000 })
  })

  test('should handle division by zero', async ({ page }) => {
    await page.click('button:has-text("5")')
    await page.click('button:has-text("/")')
    await page.click('button:has-text("0")')
    await page.click('button:has-text("=")')

    await expect(page.locator('.display')).toContainText('Error', {
      timeout: 5000,
    })
  })
})

