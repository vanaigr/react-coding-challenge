import Header from '@/components/header'
import { Form } from './form'
import { makeEquipmentInfo } from '@/util/equipmentInfo'
import { prisma } from '@/data/prisma'

export default async function Component() {
    const equipment = await prisma.equipment.findMany({
        select: {
            id: true,
            name: true,
            location: true,
            department: true,
            serialNumber: true,
            status: true,
        }
    })
    return <div className='grow flex flex-col items-stretch'>
        <Header path={[{ url: '/maintenance', name: 'Maintenance records' }]} name='new'/>
        <Form equipment={makeEquipmentInfo(equipment)}/>
    </div>
}
