import { type NextRequest, NextResponse } from 'next/server'

import { toISODate, strDateToComponents } from '@/util/date'
import type { Equipment } from '@/data/recordDefs'
import { prisma } from '@/data/prisma'
import { equipmentValidationWithoutId as v } from '@/data/recordDefs'

export async function GET(_q: NextRequest) {
    const recordsDb = await prisma.equipment.findMany()
    const records: Equipment[] = []
    for(let i = 0; i < recordsDb.length; i++) {
        const itDb = recordsDb[i]
        records.push({
            ...itDb,
            installDate: strDateToComponents(itDb.installDate)!
        })
    }

    return NextResponse.json({ ok: true, data: records })
}

export async function POST(q: NextRequest) {
    const res = v.safeParse(await q.json())
    if(!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 })
    }

    const resDb = await prisma.equipment.create({
        data: { ...res.data, installDate: toISODate(res.data.installDate) },
    })

    return NextResponse.json({ ok: true, data: { id: resDb.id } })
}
