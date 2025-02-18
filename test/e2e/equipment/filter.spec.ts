import {
    test,
    expect,
} from '@playwright/test'
import * as filtered from './filtered'
import { eachResetDB } from '../common'

eachResetDB()

test('Should filter equipment table', async ({ page }) => {
    await page.goto('http://localhost:3000/equipment');

    const hdr = `
- button "Id ▲ ▼"
- button "Name ▲ ▼"
- button "Location ▲ ▼"
- button "Department ▲ ▼"
- button "Model ▲ ▼"
- button "Serial number ▲ ▼"
- button "Install date ▲ ▼"
- button "Status ▲ ▼"
`

    function chk(data: string, filters: string) {
        const snap = hdr.trim() + '\n' + filters.trim() + '\n' + data.trim() + '\n'
        return expect(page.getByTestId('table')).toMatchAriaSnapshot(snap)
    }

    await page.getByText("Showingall1050per page").getByRole('combobox')
        .selectOption('999999999');

    await chk(
        filtered.getAllSnapshot(),
        `
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`,
    )

    await page.getByPlaceholder('Search').first().fill('66');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.id),
`
- checkbox
- textbox: "66"
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('Search').first().fill('');

    await page.getByPlaceholder('Search').nth(1).fill('h');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.name),
`
- checkbox
- textbox
- textbox: h
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('Search').nth(1).fill('');

    await page.getByPlaceholder('Search').nth(2).fill('31');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.location),
`
- checkbox
- textbox
- textbox
- textbox: /\\d+/
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('Search').nth(2).fill('');

    await page.getByLabel('AllMachiningAssemblyPackagingShipping').selectOption('Packaging');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.department),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All"
  - option "Machining"
  - option "Assembly"
  - option "Packaging" [selected]
  - option "Shipping"
- textbox
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
        `
    );
    await page.getByLabel('AllMachiningAssemblyPackagingShipping').selectOption('');

    await page.getByPlaceholder('Search').nth(3).fill('a');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.model),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox: a
- textbox
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('Search').nth(3).fill('');

    await page.getByPlaceholder('Search').nth(4).fill('ag');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.serialNumber),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox: ag
- textbox
- text: First
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('Search').nth(4).fill('');

    await page.getByPlaceholder('First').fill('2025-01-01');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.dateFirst),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox: /\\d+-\\d+-\\d+/
- textbox
- text: Last
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );

    await page.getByPlaceholder('Last').fill('2025-01-10');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.dateBoth),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox: /\\d+-\\d+-\\d+/
- textbox: /\\d+-\\d+-\\d+/
- combobox:
  - option "All" [selected]
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired"
`
    );
    await page.getByPlaceholder('First').fill('');
    await page.getByPlaceholder('Last').fill('');

    await page.getByLabel('AllOperationalDownMaintenanceRetired').selectOption('Retired');
    await chk(
        filtered.getFilteredSnapshot(filtered.filteredBy.status),
`
- checkbox
- textbox
- textbox
- textbox
- combobox:
  - option "All" [selected]
  - option "Machining"
  - option "Assembly"
  - option "Packaging"
  - option "Shipping"
- textbox
- textbox
- textbox
- textbox
- combobox:
  - option "All"
  - option "Operational"
  - option "Down"
  - option "Maintenance"
  - option "Retired" [selected]
`
    );
});
