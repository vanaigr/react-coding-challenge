import { redirect } from "next/navigation"

import { type CompletionStatuses } from '@/data/recordDefs'
import Header from '@/components/header'
import { Form, EquipmentInfo } from './form'
import { strDateToComponents } from '@/util/date'
import { prisma } from '@/data/prisma'

export default async function Component({ params }: any) {
    const id: string = params.id

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
        return redirect('/404')
    }

    const equipmentDb = await equipmentP
    const equipment: EquipmentInfo[] = Array(equipmentDb.length)
    for(let i = 0; i < equipment.length; i++) {
        const it = equipmentDb[i]
        equipment[i] = {
            id: it.id,
            name: it.name,
            desc: '"' + it.name + '" in ' + it.location
                + '\nDepartment: ' + it.department
                + '\nSerial: ' + it.serialNumber
                + '\nStatus: ' + it.status
        }
    }

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
