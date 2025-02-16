import { test, expect } from '@playwright/test'
import { eachResetDB } from '../common'
import { expectEquipmentRow } from './common'

eachResetDB()

test('Should create new equipment with valid data', async({ page }) => {
    await page.goto('/equipment')

    await page.getByPlaceholder('Search').nth(1).fill('new item')
    await expect(page.locator("text=Selected: 0 of 0")).toBeVisible()

    await page.getByRole('link', { name: 'Add equipment record' }).click()
    await page.getByRole('textbox', { name: 'Name' }).fill('new item')
    await page.getByRole('textbox', { name: 'Location' }).fill('locat')
    await page.getByLabel('Department').selectOption('Packaging')
    await page.getByRole('textbox', { name: 'Model' }).fill('mod')
    await page.getByRole('textbox', { name: 'Serial number' }).fill('seri')
    await page.getByRole('textbox', { name: 'Install date' }).fill('1212-12-12')
    await page.getByLabel('Status').selectOption('Retired')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.locator("text=Selected: 0 of 31")).toBeVisible()

    await page.getByPlaceholder('Search').nth(1).fill('new item')
    await expect(page.locator("text=Selected: 0 of 1")).toBeVisible()

    await expectEquipmentRow(page, {
        name: 'new item',
        location: 'locat',
        department: 'Packaging',
        model: 'mod',
        serialNumber: 'seri',
        installDate: '12/12/1212',
        status: 'Retired'
    })
})
