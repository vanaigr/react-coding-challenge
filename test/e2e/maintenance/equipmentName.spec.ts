import { test, expect, type Page } from '@playwright/test'
import { eachResetDB } from '../common'
import { maintenanceEquipment } from './maintenanceEquipmentInfo'

eachResetDB()

test.describe('Should show equipment name in maintenance table', () => {
    test('When ungroupped', async({ page }) => {
        await page.goto('/maintenance')

        const showN = page.getByText("Showingall1050per page").getByRole('combobox')
        await showN.selectOption('50')
        await showN.selectOption('999999999')
        await expect(page.getByText('Page: 1 of 1', { exact: true })).toBeVisible()

        const ps: Array<Promise<void>> = []
        let i = 0
        for(const id in maintenanceEquipment) {
            if(i >= 10) break
            const info = maintenanceEquipment[id as keyof typeof maintenanceEquipment]
            const eqId = getCell(page, id).locator('+ *')
            const eqName = eqId.locator('+ *')

            ps.push(expect(eqId, 'Equipment id for record id=' + id).toBeVisible())
            ps.push(expect(
                eqId.getByText(info.id),
                'Record id=' + id + ' has equipment id'
            ).toBeVisible())

            ps.push(expect(eqName, 'Equipment name for record id=' + id).toBeVisible())
            ps.push(expect(
                eqName.getByText(info.name),
                'Record id=' + id + ' has equipment name'
            ).toBeVisible())

            i++
        }

        await Promise.all(ps)
    })

    test('When groupped', async({ page }) => {
        await page.goto('/maintenance')

        const showN = page.getByText("Showingall1050per page").getByRole('combobox')
        await showN.selectOption('50')
        await showN.selectOption('999999999')
        await expect(page.getByText('Page: 1 of 1', { exact: true })).toBeVisible()

        await page.getByRole('button', { name: 'Group' }).click()

        const equipmentNames: Record<string, string> = {}
        for(const id in maintenanceEquipment) {
            const info = maintenanceEquipment[id as keyof typeof maintenanceEquipment]
            equipmentNames[info.id] = info.name
        }

        const ps: Array<Promise<void>> = []
        let i = 0
        for(const id in equipmentNames) {
            if(i >= 10) break
            const eqName = getCell(page, id).locator('+ *').locator('+ *')

            ps.push(expect(
                eqName,
                'Equipment id=' + id + ' has equipment name'
            ).toBeVisible())
            ps.push(expect(
                eqName.getByText(equipmentNames[id as keyof typeof equipmentNames]),
                'Equipment name for equipment id=' + id
            ).toBeVisible())

            i++
        }

        await Promise.all(ps)
    })
})

function getCell(page: Page, text: string) {
    return page.getByTestId('m-table').locator('> *:has(:text("' + text + '"))')
}
