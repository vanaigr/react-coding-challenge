// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
} from '../common.js'

describe('Deleting equipment', () => {
    beforeEach(resetDB)

    async function expectUnchanged(id) {
        const res = await expectJson(api('equipment', 'GET'), 200)
        expectApiArr(res)
        const d = res.data
        expect(d.length).toEqual(30)
        const item = d.find(it => it.id === id)
        expect(item).not.toBeUndefined()
    }


    it('By id', async() => {
        const id = '82b85eaa-f186-45a1-a1d3-2979b467f995'
        await expectUnchanged(id)

        {
            const res = await expectJson(api(
                'equipment/' + encodeURIComponent(id),
                'DELETE'
            ), 200)
            expect(res.ok).withContext(JSON.stringify(res)).toBeTrue()
        }

        {
            const res = await expectJson(api('equipment', 'GET'), 200)
            expectApiArr(res)
            const d = res.data
            expect(d.length).toEqual(29)
            const item = d.find(it => it.id === id)
            expect(item).toBeUndefined()
        }
    })

    it('Rejects if referenced by other records', async() => {
        const id = 'ecda534c-bd94-41b8-b9ba-29c444af78f3'
        await expectUnchanged(id)

        {
            const res = await expectJson(api(
                'equipment/' + encodeURIComponent(id),
                'DELETE'
            ), 200)
            expect(res.ok).withContext(JSON.stringify(res)).not.toBeTrue()
            expect(res.error).toEqual('Referenced by other records')
        }

        {
            const res = await expectJson(api('equipment', 'GET'), 200)
            expectApiArr(res)
            const d = res.data
            expect(d.length).toEqual(30)
            const item = d.find(it => it.id === id)
            expect(item).not.toBeUndefined()
        }
    })

    it('Rejects if does not exist', async() => {
        const id = 'does-not-exist'

        {
            const res = await expectJson(api('equipment', 'GET'), 200)
            expectApiArr(res)
            const d = res.data
            expect(d.length).toEqual(30)
            const item = d.find(it => it.id === id)
            expect(item).toBeUndefined()
        }

        const res = await expectJson(api(
            'equipment/' + encodeURIComponent(id),
            'DELETE'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).not.toBeTrue()
    })
})
