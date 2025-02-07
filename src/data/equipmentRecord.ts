import { z } from 'zod'

import { dateValidation } from '@/util/date'

export const departments = ['Machining', 'Assembly', 'Packaging', 'Shipping'] as const
export const statuses = ['Operational', 'Down', 'Maintenance', 'Retired'] as const

export const validation = z.object({
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.string().pipe(z.enum(departments)),
    model: z.string().nonempty('Must not be empty'),
    serialNumber: z.string().regex(/^[\p{L}\p{N}]+$/u, 'Must be alphanumeric'),
    installDate: z.string().pipe(dateValidation),
    status: z.string().pipe(z.enum(statuses)),
})

export type RawEquipmentRecord = z.input<typeof validation>
export type ValidatedEquipmentRecord = z.infer<typeof validation>

export type Equipment = ValidatedEquipmentRecord & { id: string }
