import { z } from 'zod'

import { cmp as dateCmp, dateValidation, dateLocalToComponents } from '@/util/date'
import { types, priorities, completionStatuses } from '@/data/recordDefs'



export const validation = z.object({
    // This should check if it is one of the id's we know, but the
    // selection will be from a dropdown, so only valid values and '' are
    // possible (without devtools, but this is an internal tool?).
    // Besides, zod doesn't have parsing context. So we can't even pass
    // the allowed values without something like:
    // transform((p, ctx) => if(!p.allowed.includes(p.val)) error else return p.val).
    equipmentId: z.string().nonempty('Reqired'),
    date: z.string().pipe(dateValidation).refine(it => {
        const today = dateLocalToComponents(new Date())!
        return dateCmp(it, today) <= 0
    }, 'Must not be future date'),
    type: z.enum(types),
    technician: z.string().min(2, 'Must be at least 2 characters long'),
    // TODO: should this be an integer?
    hoursSpent: z.string().transform((it, ctx) => {
        // there's z.coerce.number(), but it parses '' as 0 which is wrong for our case
        const v = parseFloat(it)
        if(isFinite(v)) return v
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be valid' })
        return z.NEVER
    }).pipe(z.number().min(1, 'Must be positive').max(24, 'Must be at most 24')),
    description: z.string().min(10, 'Must be at least 10 characters long'),
    partsReplaced: z.array(z.string()), // empty if none
    priority: z.enum(priorities),
    completionStatus: z.enum(completionStatuses),
})

export type Raw = z.input<typeof validation>
export type Validated = z.infer<typeof validation>

export type FormData = { input: Raw, result: z.SafeParseReturnType<Raw, Validated> }

export function createFormData(input: Raw): FormData {
    const result = validation.safeParse(input)
    return { input, result }
}
