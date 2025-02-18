import { test, expect, type Page, type Locator } from '@playwright/test'

test.describe('Should validate maintenance hours (reject negative/over 24)', () => {
    // > (required, positive number, max 24)

    test('Rejects empty input', async({ page }) => {
        await page.goto('/maintenance/new')
        const input = page.getByRole('spinbutton', { name: 'Hours spent' })

        await input.fill('1')
        await valid(input)

        await input.fill('')
        await invalid(page, input, 'Must be valid')

        await input.fill('1')
        await valid(input)

        await input.pressSequentially('1.-')
        await invalid(page, input, 'Must be valid')
    })

    test('Rejects non-positive values', async({ page }) => {
        await page.goto('/maintenance/new')
        const input = page.getByRole('spinbutton', { name: 'Hours spent' })

        await input.fill('1')
        await valid(input)

        await input.fill('-1');
        await invalid(page, input, 'Must be positive')

        await input.fill('1')
        await valid(input)

        await input.fill('0');
        await invalid(page, input, 'Must be positive')
    })

    test('Accepts values between 1 and 24', async({ page }) => {
        await page.goto('/maintenance/new')
        const input = page.getByRole('spinbutton', { name: 'Hours spent' })

        await input.fill('1');
        await valid(input)

        await input.fill('12');
        await valid(input)

        await input.fill('24');
        await valid(input)
    })

    test('Rejects fractional values', async({ page }) => {
        await page.goto('/maintenance/new')
        const input = page.getByRole('spinbutton', { name: 'Hours spent' })

        await input.fill('1');
        await valid(input)

        await input.fill('1.1');
        await invalid(page, input, 'Must be whole number')
    })

    test('Rejects values over 24', async({ page }) => {
        await page.goto('/maintenance/new')
        const input = page.getByRole('spinbutton', { name: 'Hours spent' })

        await input.fill('1')
        await valid(input)

        await input.fill('25');
        await invalid(page, input, 'Must be at most 24')

        await input.fill('1')
        await valid(input)

        await input.fill('999999999');
        await invalid(page, input, 'Must be at most 24')
    })
})

async function valid(input: Locator) {
    await expect(input).toHaveAttribute('aria-invalid', 'false')
}

async function invalid(page: Page, input: Locator, message: string) {
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    const id = await input.getAttribute('aria-errormessage')
    expect(id).not.toBeNull()
    await expect(page.locator('id=' + id)).toContainText(message)
};
