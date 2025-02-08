import { type DateComponents } from '@/util/date'

export const departments = ['Machining', 'Assembly', 'Packaging', 'Shipping'] as const
export const statuses = ['Operational', 'Down', 'Maintenance', 'Retired'] as const

type ValuesUnion<T extends readonly string[]> = { [K in T[number]]: K }[T[number]]

export interface Equipment {
    id: string,
    name: string,
    location: string,
    department: ValuesUnion<typeof departments>,
    model: string,
    serialNumber: string,
    installDate: DateComponents,
    status: ValuesUnion<typeof statuses>,
}

export const types = ['Preventive', 'Repair', 'Emergency'] as const
export const priorities = ['Low', 'Medium', 'High'] as const
export const completionStatuses = ['Complete', 'Incomplete', 'Pending Parts'] as const

export interface MaintenanceRecord {
    id: string,
    equipmentId: string,
    date: Date,
    type: ValuesUnion<typeof types>,
    technician: string,
    hoursSpent: number,
    description: string,
    partsReplaced?: string[],
    priority: ValuesUnion<typeof priorities>,
    completionStatus: ValuesUnion<typeof completionStatuses>,
}
