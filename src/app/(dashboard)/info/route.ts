import { type NextRequest, NextResponse } from 'next/server'

import { statuses, departments } from '@/data/recordDefs'
import type { Statuses, Types, Departments, CompletionStatuses } from '@/data/recordDefs'
import {
    fromStr,
    dateValidation,
    type DateComponents,
    toISODate,
    strDateToComponents,
} from '@/util/date'
import { prisma } from '@/data/prisma'

export type RecentMaintenanceEntry = {
    id: string
    date: DateComponents
    type: Types
    department: Departments
    completionStatus: CompletionStatuses
    hoursSpent: number
}

export type StatusCount = {
    status: Statuses
    count: number
}

export type DepartmentMaintenance = {
    department: Departments
    count: number
}

export type Data = {
    recentMaintenanceEntries: RecentMaintenanceEntry[]
    statusBreakdown: StatusCount[]
    departmentsMaintenance: DepartmentMaintenance[]
}

function wrap(msg: string) {
    return (err: unknown) => {
        // https://www.reddit.com/r/nextjs/comments/1gkxdqe/comment/m19kxgn/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
        if(err instanceof Error) console.log(err.stack)
        else console.log(err)

        throw new Error(msg)
    }
}

const cutoffValidation = fromStr.pipe(dateValidation)

export async function GET(req: NextRequest) {
    const cutoffRaw = req.nextUrl.searchParams.get('cutoff')
    const res = cutoffValidation.safeParse(cutoffRaw)

    let cutoff: DateComponents | undefined
    if(res.success) cutoff = res.data

    const recentP = recentMaintenance(cutoff).catch(wrap('Recent maintenance'))
    const statusesP = equipmentStatus().catch(wrap('Equipment status'))
    const maintenanceP = departmentsMaintenance(cutoff).catch(wrap('Maintenance hours'))

    const [recent, statuses, maintenance]
        = await Promise.all([recentP, statusesP, maintenanceP])

    return NextResponse.json({
        ok: true,
        data: {
            recentMaintenance: recent,
            statusBreakdown: statuses,
            departmentsMaintenance: maintenance,
        },
    })
}

async function recentMaintenance(cutoff?: DateComponents) {
    const recordsDb = await prisma.maintenanceRecord.findMany({
        select: {
            id: true,
            type: true,
            date: true,
            completionStatus: true,
            hoursSpent: true,
            equipment: { select: { department: true } },
        },
        where: {
            ...(cutoff ? { date: { gte: toISODate(cutoff) } } : {}),
        },
        orderBy: { date: 'desc' },
        take: 10,
    })

    const records: RecentMaintenanceEntry[] = Array(recordsDb.length)
    for(let i = 0; i < records.length; i++) {
        const itDb = recordsDb[i]

        records[i] = {
            id: itDb.id,
            type: itDb.type,
            date: strDateToComponents(itDb.date)!,
            completionStatus: itDb.completionStatus as CompletionStatuses,
            hoursSpent: itDb.hoursSpent,
            department: itDb.equipment.department,
        }
    }

    return records
}

async function equipmentStatus() {
    const resultsDb = await prisma.equipment.groupBy({
        by: ['status'],
        _count: { status: true },
    })

    const results: StatusCount[] = Array()
    for(let i = 0; i < statuses.length; i++) {
        const itDb = resultsDb.find(it => it.status === statuses[i])
        if(itDb) {
            results.push({ status: itDb.status, count: itDb._count.status })
        }
    }

    return results
}

async function departmentsMaintenance(cutoff?: DateComponents) {
    // I couldn't express this with Prisma API.
    const lines = [
        'SELECT Equipment.department AS dep, sum(MaintenanceRecord.hoursSpent) AS sum',
        'FROM MaintenanceRecord',
        'LEFT JOIN Equipment',
        'ON MaintenanceRecord.equipmentId = Equipment.id',
        ...(cutoff ? ['WHERE MaintenanceRecord.date >= $1'] : []),
        'GROUP BY Equipment.department',
    ]

    // since cutoff is optional, we have to change the query structure at runtime.
    // And Prisma's $queryRaw escaping doesn't allow that.
    const resultsDb = await prisma.$queryRawUnsafe(
        lines.join(' '),
        // https://github.com/prisma/prisma/issues/26355
        ...(cutoff ? [toISODate(cutoff)] : []),
    ) as Array<{ dep: string, sum: bigint }>

    const results: DepartmentMaintenance[] = []
    for(let i = 0; i < departments.length; i++) {
        const itDb = resultsDb.find(it => it.dep === departments[i])
        if(itDb) {
            results.push({
                department: departments[i],
                count: Number(itDb.sum),
            })
        }
    }

    return results
}
