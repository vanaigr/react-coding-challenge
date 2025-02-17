import { expect, type Page, type Locator } from '@playwright/test'
import { expectRow } from '../common'


export type MaintenanceRowDisplay = {
    equipmentId: string,
    equipmentName: string,
    date: string,
    type: string,
    technician: string,
    hoursSpent: string,
    description: string,
    partsReplaced: string,
    priority: string,
    completionStatus: string,
}
const columns = [
    'equipmentId',
    'equipmentName',
    'date',
    'type',
    'technician',
    'hoursSpent',
    'description',
    'partsReplaced',
    'priority',
    'completionStatus',
] as const
export async function expectMaintenanceRow(page: Page, it: MaintenanceRowDisplay) {
    await expectRow(page.getByTestId('m-table'), columns, it)
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
