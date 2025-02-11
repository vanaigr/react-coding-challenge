import { z } from 'zod'

// Date is represented as its components. We can't use JS builtin
// `Date` because is has timezone information. If the timezone changes
// while the app is running, the date we get from it may change.
// We can add the timezone back when sending the data to the server.

export type DateComponents = [year: number, month: number, day: number]

const dateRegex = /^(\d\d\d\d)-(\d\d)-(\d\d)$/
export function strDateToComponents(date: string): DateComponents | null {
    const res = date.match(dateRegex)
    if(res != null) {
        const y = parseInt(res[1])
        const m = parseInt(res[2])
        const d = parseInt(res[3])
        if(isFinite(y) && isFinite(m) && isFinite(d)) {
            return [y, m, d]
        }
    }

    return null
}

export function dateLocalToComponents(date: Date): DateComponents | null {
    if(date.getTime() == null) return null

    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ]
}

export function cmp(a: DateComponents, b: DateComponents) {
    let diff = 0
    for(let i = 0; diff == 0 && i < 3; i++) {
        diff = a[i] - b[i]
    }
    return diff
}

export function toISODate(it: DateComponents) {
    return ('' + it[0]).padStart(4, '0')
        + '-' + ('' + it[1]).padStart(2, '0')
        + '-' + ('' + it[2]).padStart(2, '0')
}

export function componentsToString(v: DateComponents) {
    const format = new Intl.DateTimeFormat()
    return format.format(new Date(v[0], v[1] - 1, v[2]))
}

export const dateValidation = z.string()
    .transform((it, ctx) => {
        const components = strDateToComponents(it)
        if(components == null) {
            ctx.addIssue({ code: z.ZodIssueCode.invalid_date })
            return z.NEVER
        }

        const date = new Date(components[0], components[1] - 1, components[2])
        if(
            date.getFullYear() != components[0]
                || date.getMonth() != components[1] - 1
                || date.getDate() != components[2]
        ) {
            ctx.addIssue({ code: z.ZodIssueCode.invalid_date })
            return z.NEVER
        }

        return components
    })
