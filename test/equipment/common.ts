import { expect, type Page, type Locator } from '@playwright/test'

async function order(preceding: Locator, following: Locator) {
    return await preceding.evaluate((pre, fol) => {
        const res = pre.compareDocumentPosition(fol as any)
        return (res & Node.DOCUMENT_POSITION_FOLLOWING) != 0
    }, await following.elementHandle())
}

export type EquipmentDisplay = {
    name: string,
    location: string,
    department: string,
    model: string,
    serialNumber: string,
    installDate: string,
    status: string,
}
export async function expectEquipmentRow(page: Page, it: EquipmentDisplay) {
    const table = page.getByTestId('table')

    const name = table.getByText(it.name, { exact: true }).last()
    const loc = table.getByText(it.location, { exact: true }).last()
    const dep = table.getByText(it.department, { exact: true }).last()
    const model = table.getByText(it.model, { exact: true }).last()
    const serial = table.getByText(it.serialNumber, { exact: true }).last()
    const date = table.getByText(it.installDate, { exact: true }).last()
    const status = table.getByText(it.status, { exact: true }).last()

    // Ideally we would check if right fields are in right columns,
    // but there's no way to know to get column name.
    expect(await order(name, loc)).toEqual(true)
    expect(await order(loc, dep)).toEqual(true)
    expect(await order(dep, model)).toEqual(true)
    expect(await order(model, serial)).toEqual(true)
    expect(await order(serial, date)).toEqual(true)
    expect(await order(date, status)).toEqual(true)
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
