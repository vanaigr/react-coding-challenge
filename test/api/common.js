// @ts-check
import { z } from 'zod'
import 'jasmine'

export const apiUrl = new URL('http://localhost:3000/api/')

/**
    @param {string} endpoint
    @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method
    @param {Object=} body
*/
export async function api(endpoint, method, body) {
    return await fetch(new URL(endpoint, apiUrl), {
        method: method,
        headers: {
            accept: 'application/json',
            ...(body ? { 'content-type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}

export async function expectJson(respP, status) {
    const resp = await respP
    expect(resp.status).toEqual(status)
    return await resp.json()
}

export function expectApiArr(result) {
    expect(result.ok).withContext(JSON.stringify(result)).toBe(true)
    const d = result.data
    expect(d instanceof Array).toBeTrue()
}

export async function resetDB() {
    const resp = await fetch(new URL('/test/resetDB', apiUrl.origin), { method: 'POST' })
    const res = await resp.json()
    if(!res.ok) throw new Error('Reset db error: ' + res.error)
}

// It is impossible to not duplicate this. See:
// https://stackoverflow.com/a/49058732
// https://stackoverflow.com/a/77993035
// https://github.com/TypeStrong/ts-node/pull/1585

// from recordDefs.ts and date.ts

/** @typedef {[year: number, month: number, day: number]} DateComponents */

/** @param {DateComponents} it */
export function toISODate(it) {
    return ('' + it[0]).padStart(4, '0')
        + '-' + ('' + it[1]).padStart(2, '0')
        + '-' + ('' + it[2]).padStart(2, '0')
}

/**
    @param {Date} date
    @returns {DateComponents}
*/
export function dateUTCToComponents(date) {
    return [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate()
    ]
}

export const dateValidation = z.tuple([z.number(), z.number(), z.number()])
    .transform((it, ctx) => {
        const date = new Date(it[0], it[1] - 1, it[2])
        if(
            date.getFullYear() != it[0]
                || date.getMonth() != it[1] - 1
                || date.getDate() != it[2]
        ) {
            ctx.addIssue({ code: z.ZodIssueCode.invalid_date })
            return z.NEVER
        }

        return it
    })

/**
    @param {DateComponents} a
    @param {DateComponents} b
*/
export function cmp(a, b) {
    let diff = 0
    for(let i = 0; diff == 0 && i < 3; i++) {
        diff = a[i] - b[i]
    }
    return diff
}

export const departments = /**@type{const}*/(['Machining', 'Assembly', 'Packaging', 'Shipping'])
export const statuses = /**@type{const}*/(['Operational', 'Down', 'Maintenance', 'Retired'])

export const types = /**@type{const}*/(['Preventive', 'Repair', 'Emergency'])
export const priorities = /**@type{const}*/(['Low', 'Medium', 'High'])
export const completionStatuses = /**@type{const}*/(['Complete', 'Incomplete', 'Pending Parts'])

export const equipmentConstraintsWithoutId = {
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.enum(departments),
    model: z.string().nonempty('Must not be empty'),
    serialNumber: z.string().regex(/^[a-zA-Z\d]+$/, 'Must be alphanumeric'),
    installDate: dateValidation.refine(it => {
        const today = dateUTCToComponents(new Date())
        return cmp(it, today) < 0
    }, 'Must be past date'),
    status: z.string().pipe(z.enum(statuses)),
}
export const equipmentConstraints = {
    id: z.string(),
    ...equipmentConstraintsWithoutId,
}

export const equipmentValidationWithoutId = z.object(equipmentConstraintsWithoutId)
export const equipmentValidation = z.object(equipmentConstraints)


const maintenanceConstraintsWithoutId = {
    equipmentId: z.string().nonempty('Reqired'),
    date: dateValidation.refine(it => {
        const today = dateUTCToComponents(new Date())
        return cmp(it, today) <= 0
    }, 'Must not be future date'),
    type: z.enum(types),
    technician: z.string().min(2, 'Must be at least 2 characters long'),
    hoursSpent: z.number().int('Must be whole number')
        .min(1, 'Must be positive').max(24, 'Must be at most 24'),
    description: z.string().min(10, 'Must be at least 10 characters long'),
    partsReplaced: z.array(z.string()), // empty if none
    priority: z.enum(priorities),
    completionStatus: z.enum(completionStatuses),
}
export const maintenanceConstraints = {
    id: z.string(),
    ...maintenanceConstraintsWithoutId
}
export const maintenanceValidationWithoutId = z.object(maintenanceConstraintsWithoutId)
export const maintenanceValidation = z.object(maintenanceConstraints)
