'use server'
import Cache from 'next/cache'

import {
    equipmentValidationWithoutId,
    type InputEquipmentWithoutId,
} from '@/data/recordDefs'
import { toISODate } from '@/util/date'
import { prisma } from '@/data/prisma'

export async function addEquipment(recordRaw: InputEquipmentWithoutId) {
    const result = equipmentValidationWithoutId.safeParse(recordRaw)
    if(!result.success) {
        return { ok: false, error: result.error }
    }

    await prisma.equipment.create({
        data: {
            ...result.data,
            installDate: toISODate(result.data.installDate),
        },
    })

    Cache.revalidatePath('/equipment')

    return { ok: true }
}
