import { test, expect } from '@playwright/test'
import { eachResetDB } from '../common'
import { expectMaintenanceRow } from './common'

eachResetDB()

test('Should create new maintenance record', async({ page }) => {
    await page.goto('/maintenance')
    await expect(page.locator("text=Results: 100")).toBeVisible()

    const technicianFilter = page.getByPlaceholder('Search').nth(3)

    await technicianFilter.fill('new item')
    await expect(page.locator("text=Results: 0")).toBeVisible()

    await page.getByRole('link', { name: 'Add maintenance record' }).click()

    await page.getByLabel('Equipment').selectOption('ecda534c-bd94-41b8-b9ba-29c444af78f3')
    await page.getByRole('textbox', { name: 'Date' }).fill('2020-02-10')
    await page.getByLabel('Type').selectOption('Repair')
    await page.getByRole('textbox', { name: 'Technician' }).fill('new item')
    await page.getByRole('spinbutton', { name: 'Hours spent' }).fill('12')
    await page.getByRole('textbox', { name: 'Description' }).fill('description')
    await page.getByLabel('Priority').selectOption('Medium')
    await page.getByLabel('Completion status').selectOption('Incomplete')
    await page.getByRole('textbox', { name: 'Parts replaced' }).fill('part 1')
    await page.getByRole('textbox', { name: 'Parts replaced' }).press('Enter')
    await page.getByRole('textbox', { name: 'Parts replaced' }).fill('part 2')
    await page.getByRole('button', { name: 'add', exact: true }).click()

    await page.getByRole('button', { name: 'Add', exact: true }).click()

    await expect(page.locator("text=Results: 101")).toBeVisible()

    await technicianFilter.fill('new item')
    await expect(page.locator("text=Results: 1")).toBeVisible()

    await expectMaintenanceRow(page, {
        equipmentId: 'ecda534c-bd94-41b8-b9ba-29c444af78f3',
        equipmentName: 'msfpO5',
        date: '2/10/2020',
        type: 'Repair',
        technician: 'new item',
        hoursSpent: '12',
        description: 'description',
        priority: 'Medium',
        completionStatus: 'Incomplete',
        partsReplaced: 'part 1, part 2',
    })
})
