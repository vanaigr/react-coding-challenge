import { test, expect, type Page, type Locator } from '@playwright/test'
import { eachResetDB } from '../common'
import { expectInputValid, getInputs } from './common'

eachResetDB()

test.describe('Should show validation errors for invalid equipment data', () => {
    // Note: keep /equipment as previous page
    test('On new equipment page', async({ page }) => {
        await page.goto('/equipment')
        await page.getByRole('link', { name: 'Add equipment record' }).click()
        const path = '/equipment/new'
        await expect(page).toHaveURL(path);
        await testValidation(path, page)
    })
    test('When editing equipment', async({ page }) => {
        const id = '0ec93e1d-a05c-4b9d-ba57-c935a9bbf2b6'
        const path = '/equipment/' + id

        await page.goto('/equipment')
        await page.getByPlaceholder('Search').first().fill(id)
        await page.getByTestId('table').getByRole('link', { name: 'open_in_new' })
            .first().click()

        await expect(page).toHaveURL(path);
        await testValidation(path, page)
    })
})

async function testValidation(path: string, page: Page) {
    const inputs = getInputs(page)
    const { name, loc, dep, model, serial, date, status } = inputs
    const button = page.locator('button[type="submit"]')

    const chk = async(input: Locator, error: string, invalidList: Locator[]) => {
        if(invalidList.includes(input)) {
            await expect(input).toHaveAttribute('aria-invalid', 'true')
            const id = await input.getAttribute('aria-errormessage')
            expect(id).not.toBeNull()
            await expect(page.locator('id=' + id)).toContainText(error)
        }
        else {
            await expectInputValid(input)
        }
    }
    const expectInvalid = async(...invalidInputs: Locator[]) => {
        await chk(name, 'Must be at least 3 characters', invalidInputs)
        await chk(loc, 'Must not be empty', invalidInputs)
        await expectInputValid(dep)
        await chk(model, 'Must not be empty', invalidInputs)
        await chk(serial, 'Must be alphanumeric', invalidInputs)
        await chk(date, 'Invalid date', invalidInputs)
        await expectInputValid(status)

        if(invalidInputs.length > 0) {
            await expect(button).toBeDisabled()
            // check that it doesn't let us add the equipment
            await page.getByRole('textbox', { name: 'Name' }).press('Enter');
            await expect(page).toHaveURL(path);
        }
        else {
            await expect(button).toBeEnabled()
        }
    }

    // fill with invalid values
    await name.fill('12')
    await loc.fill('')
    // Department is <select> with no invalid option
    await model.fill('')
    await serial.fill('123abc_')
    // 02/31/2020 - 31 of Feb, which is ivalid date
    await date.pressSequentially('02312020')
    // Status is also <select> with no invalid option
    await expectInvalid(name, loc, model, serial, date)

    // fill with valid values
    await name.fill('123')
    await expectInvalid(loc, model, serial, date)
    await loc.fill('1')
    await expectInvalid(model, serial, date)
    await dep.selectOption('Shipping')
    await expectInvalid(model, serial, date)
    await model.fill('1')
    await expectInvalid(serial, date)
    await serial.fill('123abc')
    await expectInvalid(date)
    await date.fill('2020-02-20')
    await expectInvalid()
    await status.selectOption('Down')
    await expectInvalid()

    await button.click()
    await expect(page).toHaveURL('/equipment')
}
