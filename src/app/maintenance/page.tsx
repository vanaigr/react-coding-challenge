import PageHeader from '@/components/header'
import { type CompletionStatuses } from '@/data/recordDefs'
import { Table, type Entry } from './table'
import { strDateToComponents, type DateComponents } from '@/util/date'
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

        type ToType = Omit<Omit<typeof itDb, 'partsReplaced'>, 'date'>
            & { partsReplaced: string[], date: DateComponents, completionStatus: CompletionStatuses }

        const it = itDb as any as ToType

        it.partsReplaced = itDb.partsReplaced.map(v => v.part)
        it.date = strDateToComponents(itDb.date)!

        data.push(it)
    }

    return <div>
        <PageHeader path={[]} name='Maintenance records'/>
        <Table data={data}/>
    </div>
}
