import { z } from 'zod'

import type { Equipment } from './equipmentDefs'
import {
    dateValidation,
    dateUTCToComponents,
    cmp as dateCmp,
    type DateComponents,
} from '@/util/date'
import type { ValuesUnion } from '@/util/types'

export const types = ['Preventive', 'Repair', 'Emergency'] as const
export const priorities = ['Low', 'Medium', 'High'] as const
export const completionStatuses = ['Complete', 'Incomplete', 'Pending Parts'] as const

export type Types = ValuesUnion<typeof types>
export type Priorities = ValuesUnion<typeof priorities>
export type CompletionStatuses = ValuesUnion<typeof completionStatuses>

export interface MaintenanceRecord {
    id: string,
    equipmentId: Equipment['id'],
    date: DateComponents,
    type: Types,
    technician: string,
    hoursSpent: number,
    description: string,
    // TODO: should this be `string[]` or `string[] | undefined`?
    // I don't think there's any semantic difference
    // between empty array and no array in this case.
    partsReplaced: string[],
    priority: Priorities,
    completionStatus: CompletionStatuses,
}

export const fieldNames: Record<keyof MaintenanceRecord, string> = {
    id: 'Id',
    equipmentId: 'Equipment id',
    date: 'Date',
    type: 'Type',
    technician: 'Technician',
    hoursSpent: 'Hours spent',
    description: 'Description',
    partsReplaced: 'Parts replaced',
    priority: 'Priority',
    completionStatus: 'Completion status',
}

export const constraintsWithoutId = {
    equipmentId: z.string().nonempty('Reqired'),
    date: dateValidation.refine(it => {
        const today = dateUTCToComponents(new Date())!
        return dateCmp(it, today) <= 0
    }, 'Must not be future date'),
    type: z.enum(types),
    technician: z.string().min(2, 'Must be at least 2 characters long'),
    // TODO: should this allow fractional values?
    hoursSpent: z.number().int('Must be whole number')
        .min(1, 'Must be positive').max(24, 'Must be at most 24'),
    description: z.string().min(10, 'Must be at least 10 characters long'),
    partsReplaced: z.array(z.string()), // empty if none
    priority: z.enum(priorities),
    completionStatus: z.enum(completionStatuses),
} as const
export const constraints = {
    id: z.string(),
    ...constraintsWithoutId
} as const

export const validationWithoutId = z.object(constraintsWithoutId)
export const validation = z.object(constraints)
export type InputWithoutId = z.infer<typeof validationWithoutId>
export type Input = z.infer<typeof validation>
