'use server'
import Cache from 'next/cache'

import { type Raw, validation } from '@/data/equipmentForm'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function updateEquipment(id: string, recordRaw: Raw) {
    const result = validation.safeParse(recordRaw)
    if(!result.success) {
        return { ok: false, error: result.error }
    }

    await prisma.equipment.update({
        where: { id },
        data: {
            ...result.data,
            installDate: toISODate(result.data.installDate),
        },
    })

    Cache.revalidatePath('/equipment')
    Cache.revalidatePath('/equipment/' + encodeURIComponent(id))

    return { ok: true }
}
