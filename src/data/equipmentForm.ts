import { z } from 'zod'

import { cmp as dateCmp, dateValidation, dateLocalToComponents } from '@/util/date'
import { statuses, departments } from '@/data/records'

// This is in a separate module because react hot reloading can hot reload
// if a given file exports only components

export const validation = z.object({
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.string().pipe(z.enum(departments)),
    model: z.string().nonempty('Must not be empty'),
    serialNumber: z.string().regex(/^[\p{L}\p{N}]+$/u, 'Must be alphanumeric'),
    installDate: z.string().pipe(dateValidation).refine(it => {
        const today = dateLocalToComponents(new Date())!
        return dateCmp(it, today) < 0
    }, 'Must be past date'),
    status: z.string().pipe(z.enum(statuses)),
})

export type Raw = z.input<typeof validation>
export type Validated = z.infer<typeof validation>

export type FormData = {
    input: Raw,
    result: z.SafeParseReturnType<Raw, Validated>,
}

export function createFormData(input: Raw): FormData {
    const result = validation.safeParse(input)
    return { input, result }
}
