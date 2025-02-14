import PageHeader from '@/components/header'
import { Table, Entry } from './table'
import { strDateToComponents, type DateComponents } from '@/util/date'
import { prisma } from '@/data/prisma'

export default async function() {
    const dbData = await prisma.equipment.findMany()

    const data: Entry[] = Array(dbData.length)
    for(let i = 0; i < data.length; i++) {
        const itDb = dbData[i]

        type ToType = Omit<typeof itDb, 'installDate'> & { installDate: DateComponents; }

        const it = itDb as any as ToType

        it.installDate = strDateToComponents(itDb.installDate)!

        data[i] = it
    }

    return <div>
        <PageHeader path={[]} name='Equipment records'/>
        <Table data={data}/>
    </div>
}

