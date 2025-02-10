import * as Z from 'zustand'
import * as R from 'react'
import * as RC from 'recharts'
import colors from 'tailwindcss/colors'

import { statuses, departments, type Statuses, type Departments } from '@/data/recordDefs'
import { store as equipmentStore } from '@/data/equipment'
import { store as maintenanceStore } from '@/data/maintenance'
import {
    cmp as dateCmp,
    toISODate,
    componentsToString,
    dateLocalToComponents,
    strDateToComponents,
    type DateComponents,
} from '@/util/date'
import Header from '@/components/header'

const departmentColor: Record<Statuses, string> = {
    Operational: colors.green[600],
    Down: colors.orange[600],
    Maintenance: colors.yellow[600],
    Retired: colors.blue[600],
}

export default function Component() {
    const [cutoff, setCutoff] = R.useState(() => {
        const now = new Date()
        now.setMonth(now.getMonth() - 8)
        return dateLocalToComponents(now)
    })

    return <div className='grow bg-gray-100'>
        <Header name='Dashboard'/>
        <div className='max-w-[95rem] flex flex-col'>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-2 mx-auto p-2 pt-0'>
                <div className='flex col-span-full justify-start mb-8'>
                    <div className='bg-white p-3 px-4 rounded-md flex flex-col'>
                        <span className='text-sm text-gray-600'>Earliest date</span>
                        <input
                            className='pt-2'
                            type='date'
                            defaultValue={cutoff && toISODate(cutoff)}
                            onChange={it => {
                                const newCutoff = strDateToComponents(it.target.value)
                                setCutoff(newCutoff)
                            }}
                        />
                    </div>
                </div>
                <EquipmentChart cutoff={cutoff}/>
                <DepartmentChart cutoff={cutoff}/>
                <RecentMaintenance cutoff={cutoff}/>
            </div>
        </div>
    </div>
}

type Props = { cutoff?: DateComponents }

function RecentMaintenance({ cutoff }: Props) {
    const maintenance = [...Z.useStore(maintenanceStore).values()]
    const equipment = Z.useStore(equipmentStore)
    maintenance.sort((a, b) => -dateCmp(a.date, b.date))

    const components = []
    for(let i = 0; i < Math.min(10, maintenance.length); i++) {
        const m = maintenance[i]
        const e = equipment.get(m.equipmentId)!
        if(cutoff && dateCmp(m.date, cutoff) < 0) break

        if(components.length !== 0) {
            components.push(<div className='col-span-full border-t border-gray-300'/>)
        }
        components.push(<R.Fragment key={m.id}>
            <span/>
            <span>{m.type} maintenance</span>
            <span>at {e.department}</span>
            <span>on {componentsToString(m.date)}</span>
            <span>-</span>
            <span>{m.completionStatus}</span>
            <span>after {m.hoursSpent} hrs</span>
            <span/>
        </R.Fragment>)
    }

    const title = 'Recent maintenance activities'
    return <div className='flex flex-col p-5 pt-4 pb-7 bg-white rounded-md'>
        <span className='text-sm text-gray-700 mb-6'>{title}</span>
        <div className='text-sm grid gap-x-2 gap-y-3' style={{ gridTemplateColumns: 'repeat(8, auto)' }}>
            {components}
        </div>
    </div>
}

function DepartmentChart({ cutoff }: Props) {
    const equipment = Z.useStore(equipmentStore)
    const maintenance = Z.useStore(maintenanceStore)

    const departmentHours: Partial<Record<Departments, number>> = {}

    for(const m of maintenance.values()) {
        if(cutoff && dateCmp(m.date, cutoff) < 0) continue
        const e = equipment.get(m.equipmentId)
        if(e == null) continue

        const totalHours = departmentHours[e.department]
        if(totalHours == null) departmentHours[e.department] = m.hoursSpent
        else departmentHours[e.department] = totalHours + m.hoursSpent
    }

    const data: Array<{ name: string, value: number }> = []
    for(let i = 0; i < departments.length; i++) {
        const hours = departmentHours[departments[i]]
        if(hours == null) continue
        data.push({ name: departments[i], value: hours })
    }

    const title = 'Maintenance hours by department'
    return <div className='flex flex-col p-5 pt-4 bg-white rounded-md'>
        <span className='text-sm text-gray-700 mb-6'>{title}</span>
        <RC.BarChart width={500} height={250} data={data} title={title}>
            <RC.CartesianGrid strokeDasharray='3 3'/>
            <RC.XAxis dataKey='name'/>
            <RC.YAxis/>
            <RC.Bar dataKey='value' fill={colors.purple[300]} label={{ fill: colors.purple[900] }}/>
        </RC.BarChart>
    </div>
}

function EquipmentChart({}: Props) {
    const equipment = Z.useStore(equipmentStore)

    const statusCounts: Partial<Record<Statuses, number>> = {}
    let total = 0

    for(const v of equipment.values()) {
        const s = statusCounts[v.status]
        if(s == null) statusCounts[v.status] = 1
        else statusCounts[v.status] = s + 1
        total++
    }

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
    return <div className='flex flex-col p-5 pt-4 bg-white rounded-md'>
        <span className='text-sm text-gray-700 mb-6'>{title}</span>
        <RC.PieChart width={500} height={250} title={title}>
            <RC.Pie label={it => it.name} data={data} dataKey='value'>
                {data.map((it, i) => <RC.Cell key={i} fill={departmentColor[it.status]}/>)}
            </RC.Pie>
        </RC.PieChart>
    </div>
}
