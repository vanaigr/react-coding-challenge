import { test, expect } from '@playwright/test'
import { eachResetDB } from '../common'
import { expectEquipmentRow, expectInputValid, getInputs } from './common'

eachResetDB()

test('Should edit existing equipment', async({ page }) => {
    const id = '9927a87d-a69c-449c-b6e1-35daab537301'
    await page.goto('/equipment')

    await page.getByPlaceholder('Search').first().fill(id)
    await expect(page.getByText('Selected: 0 of 1')).toBeVisible()
    await expectEquipmentRow(page, {
        name: 'mVOiGSKXo3',
        location: '417 Hermann Divide Apt. 503',
        department: 'Assembly',
        model: 'ctPneL',
        serialNumber: 'AswGO5m0hI',
        installDate: '4/30/2024',
        status: 'Maintenance',
    })

    await page.getByRole('link', { name: 'open_in_new' }).click();

    const inputs = getInputs(page)
    const { name, loc, dep, model, serial, date, status } = inputs

    await name.fill('new name')
    await loc.fill('new location')
    await dep.selectOption('Machining')
    await model.fill('new model')
    await serial.fill('newserial')
    await date.fill('2020-02-10')
    await status.selectOption('Operational')

    await expectInputValid(inputs.name)
    await expectInputValid(inputs.loc)
    await expectInputValid(inputs.dep)
    await expectInputValid(inputs.model)
    await expectInputValid(inputs.serial)
    await expectInputValid(inputs.date)
    await expectInputValid(inputs.status)

    await page.getByRole('button', { name: 'Update' }).click()

    await page.getByPlaceholder('Search').first().fill(id)
    await expect(page.getByText('Selected: 0 of 1')).toBeVisible()
    await expectEquipmentRow(page, {
        name: 'new name',
        location: 'new location',
        department: 'Machining',
        model: 'new model',
        serialNumber: 'newserial',
        installDate: '2/10/2020',
        status: 'Operational',
    })
})
