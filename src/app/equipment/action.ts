'use server'
import Cache from 'next/cache'

import { prisma } from '@/data/prisma'
import { statuses, type Statuses } from '@/data/recordDefs'

export async function updateStatuses(equipmentIds: string[], status: Statuses) {
    if(!statuses.includes(status)) return

    await prisma.equipment.updateMany({
        where: { id: { in: equipmentIds } },
        data: { status },
    })

    Cache.revalidatePath('/equipment')
}
