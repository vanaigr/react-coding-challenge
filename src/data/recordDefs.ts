import { type DateComponents } from '@/util/date'
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
    // TODO: should this be `string[]` or `string[] | undefined`.
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
