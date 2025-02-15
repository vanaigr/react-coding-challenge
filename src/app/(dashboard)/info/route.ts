import { NextRequest, NextResponse } from 'next/server'

import { statuses, departments } from '@/data/recordDefs'
import type { Statuses, Types, Departments, CompletionStatuses } from '@/data/recordDefs'
import {
    dateValidation,
    type DateComponents,
    toISODate,
    strDateToComponents,
} from '@/util/date'
import { prisma } from '@/data/prisma'

export type RecentMaintenance = {
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
    recentMaintenance: RecentMaintenance[]
    statusBreakdown: StatusCount[]
    departmentsMaintenance: DepartmentMaintenance[]
}

export async function GET(req: NextRequest) {
    const cutoffRaw = req.nextUrl.searchParams.get('cutoff')
    const res = dateValidation.safeParse(cutoffRaw)

    let cutoff: DateComponents | undefined
    if(res.success) cutoff = res.data

    const recentP = recentMaintenance(cutoff)
    const statusesP = equipmentStatus()
    const maintenanceP = departmentsMaintenance(cutoff)

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

    const records: RecentMaintenance[] = Array(recordsDb.length)
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
    // since cutoff is optional, we have to change the query structure at runtime.
    // And Prisma's $queryRaw escaping doesn't allow that.
    const resultsDb = await prisma.$queryRawUnsafe(
        `
        SELECT Equipment.department AS dep, sum(MaintenanceRecord.hoursSpent) AS sum
        FROM MaintenanceRecord
        LEFT JOIN Equipment
        ON MaintenanceRecord.equipmentId = Equipment.id
        ${cutoff ? 'WHERE MaintenanceRecord.date >= $1' : '' }
        GROUP BY Equipment.department
        `,
        cutoff ? toISODate(cutoff) : undefined
    ) as Array<{ dep: string, sum: BigInt }>

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
