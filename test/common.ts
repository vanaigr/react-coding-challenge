import { test } from '@playwright/test'

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
