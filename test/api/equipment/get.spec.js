// @ts-check
import 'jasmine'

import {
    api,
    expectJson,
    expectApiArr,
    resetDB,
    equipmentValidation,
    equipmentValidationWithoutId,
} from '../common.js'

describe('Getting equipment', () => {
    beforeEach(resetDB)
    it('All', async() => {
        const d = await expectApiArr(expectJson(api('equipment', 'GET'), 200))
        expect(d.length).toEqual(30)

        for(let i = 0; i < d.length; i++) {
            const r = equipmentValidationWithoutId.safeParse(d[i])
            expect(r.error).withContext('i=' + i).toBeFalsy()
        }
    })

    it('By id', async() => {
        const id = 'f5c5285c-0af9-4502-8a4c-9e6682a04695'

        const res = await expectJson(api(
            'equipment/' + encodeURIComponent(id),
            'GET'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).toBeTrue()
        const valid = equipmentValidation.safeParse(res.data)
        expect(valid.error).toBeUndefined()
        expect(valid.data?.id).toEqual(id)
    })

    it('Rejects if does not exist', async() => {
        const id = 'does-not-exist'

        const res = await expectJson(api(
            'equipment/' + encodeURIComponent(id),
            'GET'
        ), 200)
        expect(res.ok).withContext(JSON.stringify(res)).not.toBeTrue()
    })
})
