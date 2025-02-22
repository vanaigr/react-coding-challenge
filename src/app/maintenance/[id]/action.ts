'use server'
import Cache from 'next/cache'

import { validationWithoutId, type InputWithoutId } from '@/data/maintenanceDefs'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function updateMaintenanceRecord(id: string, recordRaw: InputWithoutId) {
    const result = validationWithoutId.safeParse(recordRaw)
    if(!result.success) {
        return { ok: false, error: result.error }
    }

    await prisma.maintenanceRecord.update({
        where: { id },
        data: {
            ...result.data,
            date: toISODate(result.data.date),
            partsReplaced: {
                deleteMany: {},
                create: result.data.partsReplaced.map(it => ({ part: it })),
            },
        },
    })

    Cache.revalidatePath('/maintenance')
    Cache.revalidatePath('/maintenance/' + encodeURIComponent(id))

    return { ok: true }
}
