import { type NextRequest, NextResponse } from 'next/server'

import type { MaintenanceRecord } from '@/data/recordDefs'
import { toISODate, strDateToComponents } from '@/util/date'
import { prisma, Prisma } from '@/data/prisma'
import { maintenanceValidationWithoutId as v } from '@/data/recordDefs'

export async function GET(_q: NextRequest, { params }: any) {
    const id = (await params).id
    if(typeof id !== 'string' || id === '') {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const getResDb = await prisma.maintenanceRecord.findFirst({
        where: { id },
        include: { partsReplaced: { select: { part: true } } },
    })
    if(getResDb === null) {
        return NextResponse.json({ error: 'Record not found' })
    }
    const getRes: MaintenanceRecord = {
        ...getResDb,
        date: strDateToComponents(getResDb.date)!,
        partsReplaced: getResDb.partsReplaced.map(it => it.part),
        completionStatus: getResDb.completionStatus as MaintenanceRecord['completionStatus'],
    }

    return NextResponse.json({ ok: true, data: getRes })
}

export async function PUT(q: NextRequest, { params }: any) {
    const id = (await params).id
    if(typeof id !== 'string' || id === '') {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const itRaw = await q.json()
    const res = v.safeParse(itRaw)
    if(!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 })
    }

    const updateRes = await prisma.maintenanceRecord.update({
        where: { id },
        data: {
            ...res.data,
            partsReplaced: {
                deleteMany: {},
                create: res.data.partsReplaced.map(it => ({ part: it })),
            },
            date: toISODate(res.data.date),
        },
    }).then(() => ({ ok: true })).catch(err => {
        if(err instanceof Prisma.PrismaClientKnownRequestError) {
            if(err.code === 'P2025') {
                return { ok: false, error: 'Given record does not exist' }
            }
            else if(err.code === 'P2003') {
                return { ok: false, error: 'Equipment with the given id does not exist' }
            }
            console.log(err)
        }
        throw err
    })

    return NextResponse.json(updateRes)
}

// TODO: PATCH

export async function DELETE(_q: NextRequest, { params }: any) {
    const id = (await params).id
    if(typeof id !== 'string' || id === '') {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const deleteRes = await prisma.maintenanceRecord.delete({ where: { id } })
        .then(() => ({ ok: true }))
        .catch(err => {
            if(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return { ok: false, error: 'Given record does not exist' }
            }
            throw err

        })

    return NextResponse.json(deleteRes)

}
