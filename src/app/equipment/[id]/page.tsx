import { redirect } from "next/navigation"

import Header from '@/components/header'
import { Form } from './form'
import { strDateToComponents } from '@/util/date'
import { prisma } from '@/data/prisma'

export default async function({ params }: any) {
    const id: string = (await params).id
    if(id == null) {
        return redirect('/404')
    }

    const recordDb = await prisma.equipment.findFirst({
        where: { id },
    })
    if(recordDb == null) {
        return redirect('/404')
    }

    const record = {
        ...recordDb,
        installDate: strDateToComponents(recordDb.installDate)!,
    }

    return <div className='grow flex flex-col'>
        <Header path={[{ url: '/equipment', name: 'Equipment records' }]} name={id}/>
        <Form
            id={id}
            initial={record}
        />
    </div>
}
