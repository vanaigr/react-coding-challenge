// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
} from '../common.js'

describe('Deleting maintenance records', () => {
    beforeEach(resetDB)

    async function expectUnchanged(id) {
        const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
        expect(d.length).toEqual(100)
        const item = d.find(it => it.id === id)
        expect(item).not.toBeUndefined()
        return item
    }


    it('By id with parts', async() => {
        const id = '71c66a25-f553-4a59-ae6d-dab1ce122371'
        const item = await expectUnchanged(id)
        expect(item.partsReplaced.length).toBeGreaterThan(0)

        {
            const res = await expectJson(api(
                'maintenance/' + encodeURIComponent(id),
                'DELETE'
            ), 200)
            expect(res.ok).withContext(JSON.stringify(res)).toBeTrue()
        }

        {
            const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
            expect(d.length).toEqual(99)
            const item = d.find(it => it.id === id)
            expect(item).toBeUndefined()
        }
    })

    it('By id without parts', async() => {
        const id = '687a989d-0b4b-428d-845f-c768d4eac25d'
        const item = await expectUnchanged(id)
        expect(item.partsReplaced.length).toEqual(0)

        {
            const res = await expectJson(api(
                'maintenance/' + encodeURIComponent(id),
                'DELETE'
            ), 200)
            expect(res.ok).withContext(JSON.stringify(res)).toBeTrue()
        }

        {
            const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
            expect(d.length).toEqual(99)
            const item = d.find(it => it.id === id)
            expect(item).toBeUndefined()
        }
    })

    it('Rejects if does not exist', async() => {
        const id = 'does-not-exist'

        async function chk() {
            const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
            expect(d.length).toEqual(100)
            const item = d.find(it => it.id === id)
            expect(item).toBeUndefined()
        }

        chk()
        const res = await expectJson(api(
            'maintenance/' + encodeURIComponent(id),
            'DELETE'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).not.toBeTrue()
        chk()
    })
})
