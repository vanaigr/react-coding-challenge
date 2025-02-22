import PageHeader from '@/components/header'
import type { CompletionStatuses } from '@/data/recordDefs'
import { Table, type Entry } from './table'
import { strDateToComponents } from '@/util/date'
import { prisma } from '@/data/prisma'

export default async function() {
    const dbData = await prisma.maintenanceRecord.findMany({
        include: {
            equipment: { select: { name: true } },
            partsReplaced: { select: { part: true } },
        },
    })

    const data: Entry[] = Array(dbData.length)
    for(let i = 0; i < data.length; i++) {
        const itDb = dbData[i]

        const it = {
            ...itDb,
            partsReplaced: itDb.partsReplaced.map(v => v.part),
            date: strDateToComponents(itDb.date)!,
            completionStatus: itDb.completionStatus as CompletionStatuses
        }

        data[i] = it
    }

    return <div className='min-w-fit'>
        <PageHeader path={[]} name='Maintenance records'/>
        <Table data={data}/>
    </div>
}
