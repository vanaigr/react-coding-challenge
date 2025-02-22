import { test, expect, type Page } from '@playwright/test'
import { eachResetDB } from '../common'

eachResetDB()

async function setup(page: Page) {
    await page.goto('/maintenance')

    const showN = page.getByText("Showingall1050per page").getByRole('combobox')
    await showN.selectOption('50')
    await showN.selectOption('999999999')
    await expect(page.getByText('Page: 1 of 1', { exact: true })).toBeVisible()

    const texts = await page.getByText(/\d+\/\d+\/\d+/).allTextContents()
    const belowFirst = texts.map(parse).filter(it => cmp(it, [2025, 1, 2]) < 0).length
    expect(belowFirst).toBeGreaterThan(0)

    const aboveLast = texts.map(parse).filter(it => cmp(it, [2025, 1, 14]) > 0).length
    expect(aboveLast).toBeGreaterThan(0)

    return { total: texts.length, below: belowFirst, above: aboveLast }
}

test.describe('Should filter maintenance records by date range', () => {
    test('By first date only', async({ page }) => {
        const initial = await setup(page)
        const filter = page.locator('span').filter({ hasText: 'FirstLast' })
        await filter.getByPlaceholder('First').fill('2025-01-02')

        const texts = await page.getByText(/\d+\/\d+\/\d+/).allTextContents()
        const outsideRange = texts.map(parse).filter(it => cmp(it, [2025, 1, 2]) < 0)
        expect(outsideRange.length).toEqual(0)
        expect(texts.length).toEqual(initial.total - initial.below)
    })

    test('By last date only', async({ page }) => {
        const initial = await setup(page)
        const filter = page.locator('span').filter({ hasText: 'FirstLast' })
        await filter.getByPlaceholder('Last').fill('2025-01-14')

        const texts = await page.getByText(/\d+\/\d+\/\d+/).allTextContents()
        const outsideRange = texts.map(parse).filter(it => cmp(it, [2025, 1, 14]) > 0)
        expect(outsideRange.length).toEqual(0)
        expect(texts.length).toEqual(initial.total - initial.above)
    })

    test('By both dates', async({ page }) => {
        const initial = await setup(page)
        const filter = page.locator('span').filter({ hasText: 'FirstLast' })
        await filter.getByPlaceholder('First').fill('2025-01-02')
        await filter.getByPlaceholder('Last').fill('2025-01-14')

        const texts = await page.getByText(/\d+\/\d+\/\d+/).allTextContents()
        const outsideRange = texts.map(parse)
            .filter(it => cmp(it, [2025, 1,  2]) < 0 || cmp(it, [2025, 1, 14]) > 0)
        expect(outsideRange.length).toEqual(0)
        expect(texts.length).toEqual(initial.total - initial.above - initial.below)
    })
})

function cmp(a: readonly number[], b: readonly number[]) {
    for(let i = 0; i < 3; i++) {
        if(a[i] - b[i]) return a[i] - b[i]
    }
    return 0
}

function parse(it: string) {
    const raw = it.split('/').map(Number)
    return [raw[2], raw[0], raw[1]]
}
