'use server'
import Cache from 'next/cache'

import { type Raw, validation } from '@/data/maintenanceForm'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function addMaintenanceRecord(recordRaw: Raw) {
    const result = validation.safeParse(recordRaw)
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

    Cache.revalidatePath('/equipment')

    return { ok: true }
}
