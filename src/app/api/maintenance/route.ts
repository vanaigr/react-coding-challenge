import { NextRequest, NextResponse } from 'next/server'

import { toISODate, strDateToComponents } from '@/util/date'
import { MaintenanceRecord } from '@/data/recordDefs'
import { prisma } from '@/data/prisma'
import { maintenanceValidationWithoutId as v } from '@/data/recordDefs'

export async function GET(_q: NextRequest) {
    const recordsDb = await prisma.maintenanceRecord.findMany({
        include: { partsReplaced: { select: { part: true } } },
    })
    const records: MaintenanceRecord[] = []
    for(let i = 0; i < recordsDb.length; i++) {
        const itDb = recordsDb[i]
        records.push({
            ...itDb,
            date: strDateToComponents(itDb.date)!,
            partsReplaced: itDb.partsReplaced.map(it => it.part),
            completionStatus: itDb.completionStatus as MaintenanceRecord['completionStatus'],
        })
    }

    return NextResponse.json({ ok: true, data: records })
}

export async function POST(q: NextRequest) {
    const res = v.safeParse(q.json())
    if(!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 })
    }

    const resDb = await prisma.maintenanceRecord.create({
        data: {
            ...res.data,
            partsReplaced: { create: res.data.partsReplaced.map(it => ({ part: it })) },
            date: toISODate(res.data.date),
        },
    })

    return NextResponse.json({ ok: true, data: { id: resDb.id } })
}
