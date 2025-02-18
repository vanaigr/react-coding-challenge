'use server'
import Cache from 'next/cache'

import { maintenanceValidationWithoutId, InputMaintenanceWithoutId } from '@/data/recordDefs'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function addMaintenanceRecord(recordRaw: InputMaintenanceWithoutId) {
    const result = maintenanceValidationWithoutId.safeParse(recordRaw)
    if(!result.success) {
        return { ok: false, error: result.error }
    }

    await prisma.maintenanceRecord.create({
        data: {
            ...result.data,
            date: toISODate(result.data.date),
            partsReplaced: {
                create: result.data.partsReplaced.map(it => ({ part: it })),
            },
        },
    })

    Cache.revalidatePath('/maintenance')

    return { ok: true }
}
