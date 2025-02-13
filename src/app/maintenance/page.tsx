import { store as mStore } from '@/data/maintenance'
import { store as eStore } from '@/data/equipment'
import PageHeader from '@/components/header'
import { Table, Entry } from './table'

export default function() {
    const maintenance = mStore.getState()
    const equipment = eStore.getState()

    const data: Entry[] = []
    for(const p of maintenance) {
        const e = equipment.get(p[1].equipmentId)
        data.push({
            maintenance: p[1],
            equipment: e ? { name: e.name } : undefined,
        })
    }

    return <div>
        <PageHeader path={[]} name='Maintenance records'/>
        <Table data={data}/>
    </div>
}
