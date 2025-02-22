import { z } from 'zod'

import { fromStr } from '@/util/date'
import { maintenanceConstraintsWithoutId as c } from '@/data/recordDefs'

export const formValidation = z.object({
    // This should check if it is one of the id's we know, but the
    // selection will be from a dropdown, so only valid values and '' are
    // possible (without devtools, but this is an internal tool?).
    // Besides, zod doesn't have parsing context. So we can't even pass
    // the allowed values without something like:
    // transform((p, ctx) => if(!p.allowed.includes(p.val)) error else return p.val).
    equipmentId: z.string().pipe(c.equipmentId),
    date: z.string().pipe(fromStr).pipe(c.date),
    type: z.string().pipe(c.type),
    technician: z.string().pipe(c.technician),
    hoursSpent: z.string().transform((it, ctx) => {
        // there's z.coerce.number(), but it parses '' as 0 which is wrong for our case
        const v = Number.parseFloat(it)
        if(Number.isFinite(v)) return v
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be valid' })
        return z.NEVER
    }).pipe(c.hoursSpent),
    description: z.string().pipe(c.description),
    partsReplaced: z.array(z.string()).pipe(c.partsReplaced),
    priority: z.string().pipe(c.priority),
    completionStatus: z.string().pipe(c.completionStatus),
}) // we can't pipe it into z.object() because it short curcuits...

export type Raw = z.input<typeof formValidation>
export type Validated = z.infer<typeof formValidation>

export type FormState = { input: Raw, result: z.SafeParseReturnType<Raw, Validated> }

export function createFormState(input: Raw): FormState {
    const result = formValidation.safeParse(input)
    return { input, result }
}
