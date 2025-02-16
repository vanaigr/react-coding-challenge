import { test, expect, type Locator, type Page } from '@playwright/test'

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

test('Should show validation errors for invalid equipment data', async({ page }) => {
    const url = '/equipment/new'
    await page.goto(url)

    const inputs = getInputs(page)
    const { name, loc, dep, model, serial, date, status } = inputs

    // fill with invalid values
    await name.fill('12')
    await loc.fill('')
    // Department is <select> with no invalid option
    await model.fill('')
    await serial.fill('123abc_')
    // 02/31/2020 - 31 of Feb, which is ivalid date
    await date.pressSequentially('02312020')
    // Status is also <select> with no invalid option

    const button = page.getByRole('button', { name: 'Add' })
    await expect(button).toBeDisabled()

    const chk = async(input: Locator, error: string) => {
        await expect(input).toHaveAttribute('aria-invalid', 'true')
        const id = await input.getAttribute('aria-errormessage')
        expect(id).not.toBeNull()
        await expect(page.locator('id=' + id)).toContainText(error)
    }
    await chk(name, 'Must be at least 3 characters')
    await chk(loc, 'Must not be empty')
    await expectValid(dep)
    await chk(model, 'Must not be empty')
    await chk(serial, 'Must be alphanumeric')
    await chk(date, 'Invalid date. Must be past date')
    await expectValid(status)

    // check that it doesn't let us add the equipment
    await page.getByRole('textbox', { name: 'Name' }).press('Enter');
    await expect(page).toHaveURL(url);

    // fill with valid values
    await name.fill('123')
    await loc.fill('1')
    await dep.selectOption('Shipping')
    await model.fill('1')
    await serial.fill('123abc')
    await date.fill('2020-02-20')
    await status.selectOption('Down')

    await expectInputsValid(inputs)

    await expect(button).toBeEnabled()
    await button.click()
})

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
    expectInputsValid(inputs)

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

async function order(preceding: Locator, following: Locator) {
    return await preceding.evaluate((pre, fol) => {
        const res = pre.compareDocumentPosition(fol as any)
        return (res & Node.DOCUMENT_POSITION_FOLLOWING) != 0
    }, await following.elementHandle())
}

type EquipmentDisplay = {
    name: string,
    location: string,
    department: string,
    model: string,
    serialNumber: string,
    installDate: string,
    status: string,
}
async function expectEquipmentRow(page: Page, it: EquipmentDisplay) {
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

async function expectValid(it: Locator) {
    return await expect(it).toHaveAttribute('aria-invalid', 'false')
}

function getInputs(page: Page) {
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

async function expectInputsValid(inputs: ReturnType<typeof getInputs>) {
    await expectValid(inputs.name)
    await expectValid(inputs.loc)
    await expectValid(inputs.dep)
    await expectValid(inputs.model)
    await expectValid(inputs.serial)
    await expectValid(inputs.date)
    await expectValid(inputs.status)
}
