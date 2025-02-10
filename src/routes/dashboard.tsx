import * as Z from 'zustand'
import * as R from 'react'
import * as RC from 'recharts'
import colors from 'tailwindcss/colors'

import { statuses, departments, type Statuses, type Departments } from '@/data/recordDefs'
import { store as equipmentStore } from '@/data/equipment'
import { store as maintenanceStore } from '@/data/maintenance'

const departmentColor: Record<Statuses, string> = {
    Operational: colors.green[600],
    Down: colors.orange[600],
    Maintenance: colors.yellow[600],
    Retired: colors.blue[600],
}

export default function Component() {
    return <DepartmentChart/>
}

function DepartmentChart() {
    const equipment = Z.useStore(equipmentStore)
    const maintenance = Z.useStore(maintenanceStore)

    const departmentHours: Partial<Record<Departments, number>> = {}

    for(const m of maintenance.values()) {
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
    return <div className='flex flex-col items-center'>
        <span className='text-xl font-bold text-gray-800'>{title}</span>
        <RC.BarChart width={500} height={250} data={data} title={title}>
            <RC.CartesianGrid strokeDasharray='3 3'/>
            <RC.XAxis dataKey='name'/>
            <RC.YAxis/>
            <RC.Bar dataKey='value' fill={colors.purple[300]} label={{ fill: colors.purple[900] }}/>
        </RC.BarChart>
    </div>
}

function EquipmentChart() {
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
    return <div className='flex flex-col items-center'>
        <span className='text-xl font-bold text-gray-800'>{title}</span>
        <RC.PieChart width={500} height={250} title={title}>
            <RC.Pie label={it => it.name} data={data} dataKey='value'>
                {data.map((it, i) => <RC.Cell key={i} fill={departmentColor[it.status]}/>)}
            </RC.Pie>
        </RC.PieChart>
    </div>
}
