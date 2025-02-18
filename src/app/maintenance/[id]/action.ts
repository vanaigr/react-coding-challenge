'use server'
import Cache from 'next/cache'

import { maintenanceValidationWithoutId, InputMaintenanceWithoutId } from '@/data/recordDefs'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function updateMaintenanceRecord(id: string, recordRaw: InputMaintenanceWithoutId) {
    const result = maintenanceValidationWithoutId.safeParse(recordRaw)
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
