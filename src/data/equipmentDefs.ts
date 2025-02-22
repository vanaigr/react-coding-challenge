import { z } from 'zod'

import {
    dateValidation,
    dateUTCToComponents,
    cmp as dateCmp,
    type DateComponents,
} from '@/util/date'
import type { ValuesUnion } from '@/util/types'

export const departments = ['Machining', 'Assembly', 'Packaging', 'Shipping'] as const
export const statuses = ['Operational', 'Down', 'Maintenance', 'Retired'] as const

export type Statuses = ValuesUnion<typeof statuses>
export type Departments = ValuesUnion<typeof departments>

export interface Equipment {
    id: string,
    name: string,
    location: string,
    department: Departments,
    model: string,
    serialNumber: string,
    installDate: DateComponents,
    status: Statuses,
}

export const fieldNames: Record<keyof Equipment, string> = {
    id: 'Id',
    name: 'Name',
    location: 'Location',
    department: 'Department',
    model: 'Model',
    serialNumber: 'Serial number',
    installDate: 'Install date',
    status: 'Status',
}

export const constraintsWithoutId = {
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.enum(departments),
    model: z.string().nonempty('Must not be empty'),
    // or ^[\p{L}\p{N}]+$ if unicode alphanumeric
    serialNumber: z.string().regex(/^[a-zA-Z\d]+$/, 'Must be alphanumeric'),
    installDate: dateValidation.refine(it => {
        // TODO: this should probably not be UTC, but the challenge doesn't specify
        // which timezone is canonical. If there's no canonical timezone, the user's
        // "today" may be different from server's "today". Or 2 users can have different
        // days, and then one submits "today", but for the other user it is "tomorrow"
        // and they can't edit the record.
        const today = dateUTCToComponents(new Date())!
        return dateCmp(it, today) < 0
    }, 'Must be past date'),
    status: z.string().pipe(z.enum(statuses)),
} as const
export const constraints = { id: z.string(), ...constraintsWithoutId }

export const validationWithoutId = z.object(constraintsWithoutId)
export const validation = z.object(constraints)
export type InputWithoutId = z.infer<typeof validationWithoutId>
export type Input = z.infer<typeof validation>
