import { NextRequest, NextResponse } from 'next/server'

import { type Equipment } from '@/data/recordDefs'
import { toISODate, strDateToComponents } from '@/util/date'
import { prisma, Prisma } from '@/data/prisma'
import { equipmentValidation as v } from '@/data/recordDefs'

export async function GET(_q: NextRequest, { params }: any) {
    const id = await params.id
    if(typeof id !== 'string' || id === '') {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const getResDb = await prisma.equipment.findFirst({ where: { id } })
    if(getResDb === null) {
        return NextResponse.json({ error: 'Record not found' })
    }
    const getRes: Equipment = {
        ...getResDb,
        installDate: strDateToComponents(getResDb.installDate)!,
    }

    return NextResponse.json({ ok: true, data: getRes })
}

export async function PUT(q: NextRequest) {
    const res = v.safeParse(await q.json())
    if(!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 })
    }

    const updateRes = await prisma.equipment.update({
        where: { id: res.data.id },
        data: {
            ...res.data,
            installDate: toISODate(res.data.installDate),
        },
    }).then(() => ({ ok: true })).catch(err => {
        if(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return { ok: false, error: 'Given record does not exist' }
        }
        throw err
    })

    return NextResponse.json(updateRes)
}

// TODO: PATCH

export async function DELETE(_q: NextRequest, { params }: any) {
    const id = await params.id
    if(typeof id !== 'string' || id === '') {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const deleteRes = await prisma.equipment.delete({ where: { id } })
        .then(() => ({ ok: true }))
        .catch(err => {
            if(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return { ok: false, error: 'Given record does not exist' }
            }
            throw err

        })

    return NextResponse.json(deleteRes)

}
