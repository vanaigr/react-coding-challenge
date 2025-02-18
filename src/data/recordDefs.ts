import { z } from 'zod'

import {
    dateValidation,
    dateLocalToComponents,
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

export const equipmentFieldNames: Record<keyof Equipment, string> = {
    id: 'Id',
    name: 'Name',
    location: 'Location',
    department: 'Department',
    model: 'Model',
    serialNumber: 'Serial number',
    installDate: 'Install date',
    status: 'Status',
}

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

export const maintenanceFieldNames: Record<keyof MaintenanceRecord, string> = {
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


export const equipmentConstraintsWithoutId = {
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.enum(departments),
    model: z.string().nonempty('Must not be empty'),
    // or ^[\p{L}\p{N}]+$ if unicode alphanumeric
    serialNumber: z.string().regex(/^[a-zA-Z\d]+$/, 'Must be alphanumeric'),
    installDate: dateValidation.refine(it => {
        const today = dateLocalToComponents(new Date())!
        return dateCmp(it, today) < 0
    }, 'Must be past date'),
    status: z.string().pipe(z.enum(statuses)),
} as const
export const equipmentConstraints = {
    id: z.string(),
    ...equipmentConstraintsWithoutId,
}

export const equipmentValidationWithoutId = z.object(equipmentConstraintsWithoutId)
export const equipmentValidation = z.object(equipmentConstraints)
export type InputEquipmentWithoutId = z.infer<typeof equipmentValidationWithoutId>
export type InputEquipment = z.infer<typeof equipmentValidation>


export const maintenanceConstraintsWithoutId = {
    equipmentId: z.string().nonempty('Reqired'),
    date: dateValidation.refine(it => {
        const today = dateLocalToComponents(new Date())!
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
export const maintenanceConstraints = {
    id: z.string(),
    ...maintenanceConstraintsWithoutId
} as const

export const maintenanceValidationWithoutId = z.object(maintenanceConstraintsWithoutId)
export const maintenanceValidation = z.object(maintenanceConstraints)
export type InputMaintenanceWithoutId = z.infer<typeof maintenanceValidationWithoutId>
export type InputMaintenance = z.infer<typeof maintenanceValidation>
