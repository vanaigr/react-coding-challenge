// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
    maintenanceValidation,
} from '../common.js'

describe('Getting maintenance record', () => {
    beforeEach(resetDB)
    it('All', async() => {
        const d = await expectApiArr(expectJson(api('maintenance', 'GET'), 200))
        expect(d.length).toEqual(100)

        for(let i = 0; i < d.length; i++) {
            const r = maintenanceValidation.safeParse(d[i])
            expect(r.error).withContext('i=' + i).toBeFalsy()
        }
    })

    it('By id', async() => {
        const id = '583b6aad-b8b8-4aec-8521-b1eccce0ce2f'

        const res = await expectJson(api(
            'maintenance/' + encodeURIComponent(id),
            'GET'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).toBeTrue()
        const valid = maintenanceValidation.safeParse(res.data)
        expect(valid.error).toBeUndefined()
        expect(valid.data?.id).toEqual(id)
    })

    it('Rejects if does not exist', async() => {
        const id = 'does-not-exist'

        const res = await expectJson(api(
            'maintenance/' + encodeURIComponent(id),
            'GET'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).not.toBeTrue()
    })
})
