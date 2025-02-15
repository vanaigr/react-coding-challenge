'use client'
import * as R from 'react'
import * as RC from 'recharts'
import colors from 'tailwindcss/colors'

import { type Statuses } from '@/data/recordDefs'
import {
    toISODate,
    componentsToString,
    dateLocalToComponents,
    strDateToComponents,
} from '@/util/date'
import Header from '@/components/header'
import {
    type Data,
    type RecentMaintenance,
    type DepartmentMaintenance,
    type StatusCount,
} from './info/route'

const statusColor: Record<Statuses, string> = {
    Operational: colors.green[600],
    Down: colors.orange[600],
    Maintenance: colors.violet[600],
    Retired: colors.cyan[600],
}

export default function() {
    const [cutoff, setCutoff] = R.useState(() => {
        const now = new Date()
        now.setMonth(now.getMonth() - 8)
        return dateLocalToComponents(now)
    })

    const [data, setData] = R.useState<Data | null>(null)
    R.useEffect(() => {
        if(!cutoff) return

        const controller = new AbortController()
        ;(async() => {
            const url = new URL('./info', window.location.toString())
            url.searchParams.append('cutoff', toISODate(cutoff))
            const resp = await fetch(url, {
                method: 'GET',
                headers: { accept: 'application/json' },
                signal: controller.signal
            })
            if(!resp.ok) return
            const res = await resp.json()
            if(res.ok) {
                setData(res.data as Data)
            }
            else {
                console.error(res.error)
            }
        })().catch(console.error)

        return () => controller.abort()
    }, [cutoff])

    return <div className='grow bg-gray-100'>
        <Header name='Dashboard'/>
        <div className='mx-auto max-w-[95rem] flex flex-col'>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-5 mx-auto p-2 pt-0'>
                <div className='flex col-span-full justify-start mb-8'>
                    <div className='bg-white p-3 px-4 rounded-md flex flex-col'>
                        <span className='text-sm text-gray-600'>Earliest date</span>
                        <input
                            className='pt-2'
                            type='date'
                            defaultValue={(cutoff && toISODate(cutoff)) ?? undefined}
                            onChange={it => {
                                const newCutoff = strDateToComponents(it.target.value)
                                setCutoff(newCutoff)
                            }}
                        />
                    </div>
                </div>
                <DataDisplay data={data}/>
            </div>
        </div>
    </div>
}

function DataDisplay({ data }: { data: Data | null }) {
    if(!data) return <div style={{ width: '500px' }}>Loading...</div>

    return <>
        <EquipmentChart data={data.statusBreakdown}/>
        <DepartmentChart data={data.departmentsMaintenance}/>
        <RecentMaintenance data={data.recentMaintenance}/>
    </>
}

function RecentMaintenance({ data }: { data: RecentMaintenance[] }) {
    const components = []
    for(let i = 0; i < data.length; i++) {
        const it = data[i]

        if(components.length !== 0) {
            components.push(<div
              key={'d' + it.id}
              className='col-span-full border-t border-gray-300'
            />)
        }
        components.push(<R.Fragment key={'k' + it.id}>
            <span/>
            <span>{it.type} maintenance</span>
            <span>at {it.department}</span>
            <span>on {componentsToString(it.date)}</span>
            <span>-</span>
            <span>{it.completionStatus}</span>
            <span>after {it.hoursSpent} hrs</span>
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

function DepartmentChart({ data }: { data: DepartmentMaintenance[] }) {
    const title = 'Maintenance hours by department'
    return <div className='flex flex-col p-5 pt-4 bg-white rounded-md'>
        <span className='text-sm text-gray-700 mb-6'>{title}</span>
        <RC.BarChart
            width={500}
            height={250}
            data={data}
            dataKey={'department'}
            title={title}
        >
            <RC.CartesianGrid strokeDasharray='3 3'/>
            <RC.XAxis dataKey='name'/>
            <RC.YAxis/>
            <RC.Bar
                dataKey='count'
                fill={colors.purple[300]}
                label={{ fill: colors.purple[900] }}
            />
        </RC.BarChart>
    </div>
}

function EquipmentChart({ data }: { data: StatusCount[] }) {
    const proportions: Array<{ status: Statuses, name: string, value: number }> = []

    let total = 0
    for(let i = 0; i < data.length; i++) total += data[i].count

    for(let i = 0; i < data.length; i++) {
        const v = data[i]
        if(v == null) continue
        const proportion = v.count / total
        proportions.push({
            status: v.status,
            name: `${v.status} (${Math.round(proportion * 100)}%)`,
            value: proportion,
        })
    }

    const title = 'Equipment status breakdown'
    return <div className='flex flex-col p-5 pt-4 bg-white rounded-md'>
        <span className='text-sm text-gray-700 mb-6'>{title}</span>
        <RC.PieChart width={500} height={250} title={title}>
            <RC.Pie label={it => it.name} data={proportions} dataKey='value'>
                {proportions.map(
                    (it, i) => <RC.Cell key={i} fill={statusColor[it.status]}/>
                )}
            </RC.Pie>
        </RC.PieChart>
    </div>
}
