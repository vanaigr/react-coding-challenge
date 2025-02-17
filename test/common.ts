import { expect, test, type Locator } from '@playwright/test'

export function eachResetDB() {
    test.beforeEach('Reset DB', async({ page }) => {
        await page.goto('/')
        await page.evaluate(async() => {
            const url = new URL('/test/resetDB', window.location.origin)
            const resp = await fetch(url, { method: 'POST' })
            if(!resp.ok) throw new Error('Reset DB status: ' + resp.status)
            const res = await resp.json()
            if(!res.ok) throw new Error('Reset DB error: ' + res.error)
        })
    })
}

export async function expectRow<T extends Record<string, string>>(
    table: Locator,
    columns: readonly (keyof T & string)[],
    values: T,
) {
    const get = (name: string) => table.getByText(name, { exact: true }).last()

    const elements: Locator[] = []
    const visibleP: Promise<void>[] = []
    for(let i = 0; i < columns.length; i++) {
        const el = get(values[columns[i]])
        elements.push(el)
        visibleP.push(expect(el, `Element ${columns[i]}`).toBeVisible())
    }

    await Promise.all(visibleP)

    let ordersP = []
    for(let i = 0; i < elements.length - 1; i++) {
        ordersP.push(order(elements[i], elements[i + 1]))
    }

    const orders = await Promise.all(ordersP)
    for(let i = 0; i < orders.length; i++) {
        expect(orders[i], `Order of ${columns[i]} to ${columns[i + 1]}`).toEqual(true)
    }
}

async function order(preceding: Locator, following: Locator) {
    return await preceding.evaluate((pre, fol) => {
        const res = pre.compareDocumentPosition(fol as any)
        return (res & Node.DOCUMENT_POSITION_FOLLOWING) != 0
    }, await following.elementHandle())
}
