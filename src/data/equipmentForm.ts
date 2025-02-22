import { z } from 'zod'

import { fromStr } from '@/util/date'
import { constraintsWithoutId as c } from '@/data/equipmentDefs'

export const formValidation = z.object({
    name: z.string().pipe(c.name),
    location: z.string().pipe(c.location),
    department: z.string().pipe(c.department),
    model: z.string().pipe(c.model),
    serialNumber: z.string().pipe(c.serialNumber),
    installDate: z.string().pipe(fromStr).pipe(c.installDate),
    status: z.string().pipe(c.status),
})

export type Raw = z.input<typeof formValidation>
export type Validated = z.infer<typeof formValidation>

export type FormState = {
    input: Raw
    result: z.SafeParseReturnType<Raw, Validated>
}

export function createFormState(input: Raw): FormState {
    const result = formValidation.safeParse(input)
    return { input, result }
}
