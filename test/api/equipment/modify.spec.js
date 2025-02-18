// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
} from '../common.js'

const valid = {
    name: 'new item',
    location: 'loc',
    department: 'Machining',
    model: 'mod',
    serialNumber: 'serial',
    installDate: [2020, 5, 10],
    status: 'Down'
}

const invalid = [
    {
        name: 'new item',
        location: '',
        department: 'Machining',
        model: 'mod',
        serialNumber: 'serial',
        installDate: [2020, 5, 10],
        status: 'Down'
    },
    {
        name: 'new item',
        location: 'loc',
        department: 'Machinin',
        model: 'mod',
        serialNumber: 'serial',
        installDate: [2020, 5, 10],
        status: 'Down'
    },
    {
        name: 'new item',
        location: 'loc',
        department: 'Machinin',
        serialNumber: 'serial',
        installDate: [2020, 5, 10],
        status: 'Down'
    },
]

describe('Inserting equipment', () => {
    beforeEach(resetDB)

    async function checkNotPresent() {
        const res = await expectJson(api('equipment', 'GET'), 200)
        expectApiArr(res)
        const d = res.data
        expect(d.length).toEqual(30)
        expect(d.findIndex(it => it.name === 'new item')).toEqual(-1)
    }

    it('Accepts valid equipment', async() => {
        await checkNotPresent()

        const insertRes = await expectJson(api('equipment', 'POST', valid), 200)
        expect(insertRes.ok).withContext(JSON.stringify(insertRes))
            .toBeTrue()

        {
            const res = await expectJson(api('equipment', 'GET'), 200)
            expectApiArr(res)
            const d = res.data
            expect(d.length).toEqual(31)

            const foundItem = d.find(it => it.id === insertRes.data.id)
            expect(foundItem).not.toBeNull()

            expect(foundItem).toEqual({ ...valid, id: insertRes.data.id })
        }
    })

    it('Rejects invalid equipment', async() => {
        await checkNotPresent()

        for(let i = 0; i < invalid.length; i++) {
            const insertRes = await expectJson(api('equipment', 'POST', invalid[i]), 400)
            expect(insertRes.ok).withContext(JSON.stringify(insertRes))
                .not.toBeTrue()
            await checkNotPresent()
        }
    })
})

describe('Updating equipment', () => {
    beforeEach(resetDB)

    const id = '0ec93e1d-a05c-4b9d-ba57-c935a9bbf2b6'
    const url = 'equipment/' + encodeURIComponent(id)

    async function checkNotModified() {
        const res = await expectJson(api('equipment', 'GET'), 200)
        expectApiArr(res)
        const d = res.data
        expect(d.length).toEqual(30)
        const foundItemI = d.findIndex(it => it.id === id)
        expect(foundItemI).not.toEqual(-1)
        expect(d[foundItemI]).not.toEqual({ ...valid, id })
    }

    it('Accepts valid equipment', async() => {
        await checkNotModified()

        const updateRes = await expectJson(api(url, 'PUT', valid), 200)
        expect(updateRes.ok).withContext(JSON.stringify(updateRes))
            .toBeTrue()

        {
            const res = await expectJson(api('equipment', 'GET'), 200)
            expectApiArr(res)
            const d = res.data
            expect(d.length).toEqual(30)

            const foundItem = d.find(it => it.id === id)
            expect(foundItem).not.toBeNull()

            expect(foundItem).toEqual({ ...valid, id })
        }
    })

    it('Rejects invalid equipment', async() => {
        await checkNotModified()

        for(let i = 0; i < invalid.length; i++) {
            const updateRes = await expectJson(api(url, 'PUT', invalid[i]), 400)
            expect(updateRes.ok).withContext(JSON.stringify(updateRes))
                .not.toBeTrue()
            await checkNotModified()
        }
    })

    it('Rejects if does not exist', async() => {
        const nid = 'does-not-exist'
        const nurl = 'equipment/' + encodeURIComponent(nid)

        const res = await expectJson(api('equipment', 'GET'), 200)
        expectApiArr(res)
        const d = res.data
        expect(d.length).toEqual(30)
        const foundItemI = d.findIndex(it => it.id === nid)
        expect(foundItemI).toEqual(-1)

        const updateRes = await expectJson(api(nurl, 'PUT', valid), 200)
        expect(updateRes.ok).withContext(JSON.stringify(updateRes))
            .not.toBeTrue()
    })
})
