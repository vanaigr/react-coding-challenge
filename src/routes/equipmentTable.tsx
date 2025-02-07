import * as R from 'react'
import * as Z from 'zustand'
import * as RT from '@tanstack/react-table'

import { Equipment, statuses } from '@/data/equipmentRecord'
import type { DateComponents } from '@/util/date'

function componentsToString(v: DateComponents) {
    const format = new Intl.DateTimeFormat()
    return format.format(new Date(v[0], v[1] - 1, v[2]))
}

const helper = RT.createColumnHelper<Equipment>()

type Colors<T extends readonly string[]> = { [K in T[number]]: string }
const statusColors = {
    Operational: 'bg-green-200',
    Down: 'bg-red-200',
    Maintenance: 'bg-yellow-200',
    Retired: 'bg-blue-200',
} satisfies Colors<typeof statuses>

type CellProps<T, Element> = R.PropsWithChildren<{}>
    & R.DetailedHTMLProps<R.HTMLAttributes<Element>, Element>

function Cell<T extends RT.CellContext<Equipment, unknown>>(
    { className, children, ...rest }: CellProps<T, HTMLDivElement>
) {
    return <div className={'px-3 py-3 ' + (className ?? '')} {...rest}>
        {children}
    </div>
}

const columns = [
    helper.accessor('id', {
        header: 'Id',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('name', {
        header: 'Name',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('location', {
        header: 'Location',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('department', {
        header: 'Department',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('model', {
        header: 'Model',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('serialNumber', {
        header: 'Serial number',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
    helper.accessor('installDate', {
        header: 'Install date',
        cell: v => <Cell>{componentsToString(v.getValue())}</Cell>
    }),
    helper.accessor('status', {
        header: 'Status',
        cell: v => <Cell>{v.getValue()}</Cell>
    }),
]

export default function() {
    const store = R.useState(() => {
        return Z.create<Array<Equipment>>(() => exampleData)
    })[0]
    const data = store()

    const table = RT.useReactTable({
        data,
        columns,
        getCoreRowModel: RT.getCoreRowModel()
    })
    table.getTotalSize()

    return <div className='relative overflow-x-auto rounded-lg text-sm m-4'>
        <table className='w-full w-min-sm'>
            <thead>
                {table.getHeaderGroups().map(group => (
                    <tr key={group.id} className='bg-gray-300'>
                        {group.headers.map(header => (
                            <td key={header.id} className='px-3 py-3 upper font-bold text-gray-700'>
                                {header.column.columnDef.header?.toString()}
                            </td>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => {
                    const status = row.getValue<Equipment['status']>('status')
                    return <tr key={row.id} className={statusColors[status] + ' border-t border-t-gray-600'}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {RT.flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                })}
            </tbody>
        </table>
    </div>
}

const exampleData: Array<Equipment> = [
    {
        id: '12345',
        'name': 'name 1',
        'location': 'Mcdonaldburgh',
        'department': 'Machining',
        'status': 'Operational',
        'model': 'System238',
        'serialNumber': '74077711-3770-4700-a391-ad9d25b3fb54',
        'installDate': [2011, 1, 4],
    },
    {
        id: '79382',
        'name': 'name 2',
        'location': 'Jameschester',
        'department': 'Shipping',
        'status': 'Down',
        'model': 'System330',
        'serialNumber': 'c43a7647-6f7e-46fb-a06c-f0ba97e35d52',
        'installDate': [2012, 5, 8],
    },
    {
        id: '84033',
        'name': 'name 3',
        'location': 'Jasonberg',
        'department': 'Assembly',
        'status': 'Down',
        'model': 'Name607',
        'serialNumber': '06f88723-bae4-4d55-81ec-11d21f842b17',
        'installDate': [2023, 8, 7],
    },
    {
        id: '8059938',
        'name': 'name 4',
        'location': 'Maryview',
        'department': 'Machining',
        'status': 'Down',
        'model': 'Machine907',
        'serialNumber': 'd32d3ed7-a9fe-4144-ac2c-d80554da08ab',
        'installDate': [2024, 8, 8],
    },
    {
        id: '9580348',
        'name': 'name 5',
        'location': 'North Nicoleview',
        'department': 'Machining',
        'status': 'Down',
        'model': 'Between678',
        'serialNumber': 'bb9a020e-6c82-4b94-8d49-bcf5e5495b1e',
        'installDate': [2014, 5, 14],
    },
    {
        id: 'c04me8304',
        'name': 'name 6',
        'location': 'Johnchester',
        'department': 'Assembly',
        'status': 'Retired',
        'model': 'Successful589',
        'serialNumber': '03ded75f-9170-4bb1-a6a2-0970a3c0168d',
        'installDate': [2012, 9, 10],
    },
    {
        id: 'cm09483098m',
        'name': ' name 7',
        'location': 'South Emilyberg',
        'department': 'Assembly',
        'status': 'Maintenance',
        'model': 'Environment134',
        'serialNumber': 'e8e0cab2-e80f-49ce-8ec8-72c63a366f22',
        'installDate': [2018, 11, 3],
    },
    {
        id: 'xskm9ie023',
        'name': 'name 8',
        'location': 'Lake Jonathan',
        'department': 'Packaging',
        'status': 'Operational',
        'model': 'Grow691',
        'serialNumber': '0bbf11a6-fa3f-442e-b483-3147d44d0601',
        'installDate': [2013, 2, 26],
    },
    {
        id: 'zlqx983m2493',
        'name': 'name 9',
        'location': 'Rodgersfort',
        'department': 'Shipping',
        'status': 'Down',
        'model': 'Operation980',
        'serialNumber': 'bdac9ca1-e1c5-4f18-acb5-aa01a3170438',
        'installDate': [2020, 3, 15],
    },
    {
        id: '09x83n67b28',
        'name': 'name 10',
        'location': 'Lisaside',
        'department': 'Machining',
        'status': 'Down',
        'model': 'Order195',
        'serialNumber': 'd90d7a6f-2674-4a7c-b0a0-9a978db18959',
        'installDate': [2020, 9, 10],
    },
]
