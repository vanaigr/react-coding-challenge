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
