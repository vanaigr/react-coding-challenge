import { expect, type Page, type Locator } from '@playwright/test'
import { expectRow } from '../common'

export type EquipmentDisplay = {
    name: string,
    location: string,
    department: string,
    model: string,
    serialNumber: string,
    installDate: string,
    status: string,
}
const columns = [
    'name',
    'location',
    'department',
    'model',
    'serialNumber',
    'installDate',
    'status',
] as const
export async function expectEquipmentRow(page: Page, it: EquipmentDisplay) {
    await expectRow(page.getByTestId('table'), columns, it)
}

export async function expectInputValid(it: Locator) {
    return await expect(it).toHaveAttribute('aria-invalid', 'false')
}

export function getInputs(page: Page) {
    return {
        name: page.getByRole('textbox', { name: 'Name' }),
        loc: page.getByRole('textbox', { name: 'Location' }),
        dep: page.getByLabel('Department'),
        model: page.getByRole('textbox', { name: 'Model' }),
        serial: page.getByRole('textbox', { name: 'Serial number' }),
        date: page.getByRole('textbox', { name: 'Install date' }),
        status: page.getByLabel('Status'),
    }
}
