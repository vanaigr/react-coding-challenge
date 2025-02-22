import PageHeader from '@/components/header'
import { Table, type Entry } from './table'
import { strDateToComponents } from '@/util/date'
import { prisma } from '@/data/prisma'

export default async function() {
    const dbData = await prisma.equipment.findMany()

    const data: Entry[] = Array(dbData.length)
    for(let i = 0; i < data.length; i++) {
        const itDb = dbData[i]
        const it = { ...itDb, installDate: strDateToComponents(itDb.installDate)! }
        data[i] = it
    }

    return <div className='min-w-fit'>
        <PageHeader path={[]} name='Equipment records'/>
        <Table data={data}/>
    </div>
}

