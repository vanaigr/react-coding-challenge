import { store as eStore } from '@/data/equipment'
import PageHeader from '@/components/header'
import { Table, Entry } from './table'

export default function() {
    const equipment = eStore.getState()

    const data: Entry[] = []
    for(const e of equipment) {
        data.push(e[1])
    }

    return <div>
        <PageHeader path={[]} name='Equipment records'/>
        <Table data={data}/>
    </div>
}

