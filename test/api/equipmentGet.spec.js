
// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
    equipmentValidationWithoutId,
} from './common.js'

describe('Equipment list', () => {
    beforeEach(resetDB)
    it('Can get all the equipment', async() => {
        const res = await expectJson(api('equipment', 'GET'), 200)
        expectApiArr(res)
        const d = res.data
        expect(d.length).toEqual(30)

        for(let i = 0; i < d.length; i++) {
            const r = equipmentValidationWithoutId.safeParse(d[i])
            expect(r.error).withContext('i=' + i).toBeFalsy()
        }
    })
})
