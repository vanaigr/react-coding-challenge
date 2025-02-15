'use server'
import Cache from 'next/cache'

import { type Raw, validation } from '@/data/maintenanceForm'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function updateMaintenanceRecord(id: string, recordRaw: Raw) {
    const result = validation.safeParse(recordRaw)
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

    Cache.revalidatePath('/equipment')
    Cache.revalidatePath('/equipment/' + encodeURIComponent(id))

    return { ok: true }
}
