import * as Z from 'zustand'
import { useShallow as ZuseShallow } from 'zustand/shallow'
import * as R from 'react'
import * as RC from 'recharts'
import colors from 'tailwindcss/colors'

import type { ValuesUnion } from '@/util/types'
import { statuses, type Statuses } from '@/data/recordDefs'
import { store as equipmentStore } from '@/data/equipment'

const departmentColor: Record<Statuses, string> = {
    Operational: colors.green[600],
    Down: colors.orange[600],
    Maintenance: colors.yellow[600],
    Retired: colors.blue[600],
}

export default function Component() {
    const statusCounts = Z.useStore(equipmentStore, ZuseShallow(it => {
        const statusCounts: Partial<Record<Statuses, number>> = {}

        for(const v of it.values()) {
            const s = statusCounts[v.status]
            if(s == null) statusCounts[v.status] = 1
            else statusCounts[v.status] = s + 1
        }

        return statusCounts
    }))

    let total = 0
    for(const k in statusCounts) total += statusCounts[k as Statuses]!

    const data: Array<{ status: Statuses, name: string, value: number }> = []
    for(let i = 0; i < statuses.length; i++) {
        const status = statuses[i]
        const v = statusCounts[status]
        if(v == null) continue
        const proportion = v / total
        data.push({
            status: status,
            name: `${status} (${Math.round(proportion * 100)}%)`,
            value: proportion,
        })
    }

    const title = 'Equipment status breakdown'
    return <div className='flex flex-col items-center'>
        <span className='text-xl font-bold text-gray-800'>{title}</span>
        <RC.PieChart width={500} height={250} title={title}>
            <RC.Pie label={it => it.name} data={data} dataKey='value'>
                {data.map((it, i) => <RC.Cell key={i} fill={departmentColor[it.status]}/>)}
            </RC.Pie>
        </RC.PieChart>
    </div>
}
