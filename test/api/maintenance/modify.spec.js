// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
} from '../common.js'

const valid = {
    equipmentId: '6611eae5-c6da-4c0d-97a2-e4c006cc66e3',
    date: [2020, 5, 10],
    type: 'Repair',
    technician: 'techni',
    hoursSpent: 12,
    description: 'description',
    partsReplaced: ['part 1', 'part 2'],
    priority: 'Medium',
    completionStatus: 'Incomplete',
}

const invalid = [
    {
        equipmentId: '6611eae5-c6da-4c0d-97a2-e4c006cc66e3',
        date: [2020, 5, 10],
        type: 'Repair',
        technician: 'techni',
        hoursSpent: 25,
        description: 'description',
        partsReplaced: ['part 1', 'part 2'],
        priority: 'Medium',
        completionStatus: 'Incomplete',
    },
    {
        equipmentId: '6611eae5-c6da-4c0d-97a2-e4c006cc66e3',
        date: [2020, 5, 10],
        type: 'Repair',
        technician: 'techni',
        hoursSpent: 12,
        description: 'description',
        partsReplaced: [1, 'part 2'],
        priority: 'Medium',
        completionStatus: 'Incomplete',
    },
]
const invalidEquipment = {
    equipmentId: 'does-not-exist',
    date: [2020, 5, 10],
    type: 'Repair',
    technician: 'techni',
    hoursSpent: 12,
    description: 'description',
    partsReplaced: ['part 1', 'part 2'],
    priority: 'Medium',
    completionStatus: 'Incomplete',
}

describe('Inserting maintenance record', () => {
    beforeEach(resetDB)

    async function checkNotPresent() {
        const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
        expect(d.length).toEqual(100)
        expect(d.findIndex(it => it.name === 'new item')).toEqual(-1)
    }

    it('Accepts valid record', async() => {
        await checkNotPresent()

        const insertRes = await expectJson(api('maintenance', 'POST', valid), 200)
        expect(insertRes.ok).withContext(JSON.stringify(insertRes))
            .toBeTrue()

        {
            const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
            expect(d.length).toEqual(101)

            const foundItem = d.find(it => it.id === insertRes.data.id)
            expect(foundItem).not.toBeNull()

            expect(foundItem).toEqual({ ...valid, id: insertRes.data.id })
        }
    })

    it('Rejects invalid record', async() => {
        await checkNotPresent()

        for(let i = 0; i < invalid.length; i++) {
            const insertRes = await expectJson(api('maintenance', 'POST', invalid[i]), 400)
            expect(insertRes.ok).withContext(JSON.stringify(insertRes))
                .not.toBeTrue()
            await checkNotPresent()
        }
    })

    it('Rejects record with equipment that does not exist', async() => {
        await checkNotPresent()

        const insertRes = await expectJson(
            api('maintenance', 'POST', invalidEquipment),
            200
        )
        expect(insertRes.ok).withContext(JSON.stringify(insertRes))
            .not.toBeTrue()
        expect(insertRes.error).toEqual('Equipment with the given id does not exist')
        await checkNotPresent()
    })
})

describe('Updating maintenance', () => {
    beforeEach(resetDB)

    const id = 'f5919885-ab17-479d-8386-e12c58e6de99'
    const url = 'maintenance/' + encodeURIComponent(id)

    async function checkNotModified() {
        const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
        expect(d.length).toEqual(100)
        const foundItemI = d.findIndex(it => it.id === id)
        expect(foundItemI).not.toEqual(-1)
        expect(d[foundItemI]).not.toEqual({ ...valid, id })
    }

    it('Accepts valid record', async() => {
        await checkNotModified()

        const updateRes = await expectJson(api(url, 'PUT', valid), 200)
        expect(updateRes.ok).withContext(JSON.stringify(updateRes))
            .toBeTrue()

        {
            const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
            expect(d.length).toEqual(100)

            const foundItem = d.find(it => it.id === id)
            expect(foundItem).not.toBeNull()

            expect(foundItem).toEqual({ ...valid, id })
        }
    })

    it('Rejects invalid record', async() => {
        await checkNotModified()

        for(let i = 0; i < invalid.length; i++) {
            const updateRes = await expectJson(api(url, 'PUT', invalid[i]), 400)
            expect(updateRes.ok).withContext(JSON.stringify(updateRes))
                .not.toBeTrue()
            await checkNotModified()
        }
    })

    it('Rejects record with equipment that does not exist', async() => {
        await checkNotModified()

        const updateRes = await expectJson(api(url, 'PUT', invalidEquipment), 200)
        expect(updateRes.ok).withContext(JSON.stringify(updateRes))
            .not.toBeTrue()
        expect(updateRes.error).toEqual('Equipment with the given id does not exist')
        await checkNotModified()
    })

    it('Rejects if does not exist', async() => {
        const nid = 'does-not-exist'
        const nurl = 'maintenance/' + encodeURIComponent(nid)

        const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
        expect(d.length).toEqual(100)
        const foundItemI = d.findIndex(it => it.id === nid)
        expect(foundItemI).toEqual(-1)

        const updateRes = await expectJson(api(nurl, 'PUT', valid), 200)
        expect(updateRes.ok).withContext(JSON.stringify(updateRes))
            .not.toBeTrue()
    })
})
