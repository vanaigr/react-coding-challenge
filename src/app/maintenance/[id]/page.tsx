import { notFound } from "next/navigation"

import { type CompletionStatuses } from '@/data/recordDefs'
import Header from '@/components/header'
import { Form } from './form'
import { strDateToComponents } from '@/util/date'
import { makeEquipmentInfo } from '@/util/equipmentInfo'
import { prisma } from '@/data/prisma'

export default async function Component({ params }: any) {
    const id: string = (await params).id
    if(id == null) {
        return notFound()
    }

    const recordP = prisma.maintenanceRecord.findFirst({
        where: { id },
        include: { partsReplaced: { select: { part: true } } },
    })
    const equipmentP = prisma.equipment.findMany({
        select: {
            id: true,
            name: true,
            location: true,
            department: true,
            serialNumber: true,
            status: true,
        }
    })

    const recordDb = await recordP
    if(recordDb == null) {
        return notFound()
    }

    const equipmentDb = await equipmentP
    const equipment = makeEquipmentInfo(equipmentDb)

    const record = {
        ...recordDb,
        partsReplaced: recordDb.partsReplaced.map(v => v.part),
        date: strDateToComponents(recordDb.date)!,
        completionStatus: recordDb.completionStatus as CompletionStatuses
    }

    return <div className='grow flex flex-col items-stretch'>
        <Header path={[{ url: '/maintenance', name: 'Maintenance records' }]} name={id}/>
        <Form
            id={record.id}
            initial={record}
            equipment={equipment}
        />
    </div>
}
