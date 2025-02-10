import * as R from 'react'
import * as Z from 'zustand'
import * as RT from '@tanstack/react-table'

import { type Equipment, departments, statuses, equipmentFieldNames } from '@/data/recordDefs'
import { componentsToString } from '@/util/date'
import { store } from '@/data/equipment'
import Header from '@/components/header'

import {
    Cell,
    mkHeader,
    headerCheckbox,
    cellCheckbox,
    textFilter,
    mkSelectFilter,
    dateSortingFn,
    dateFilterFn,
    dateFilter,
} from '@/components/grid'

const helper = RT.createColumnHelper<Equipment>()

type Colors<T extends readonly string[]> = { [K in T[number]]: string }
const statusColors = {
    Operational: 'bg-green-200',
    Down: 'bg-red-200',
    Maintenance: 'bg-yellow-200',
    Retired: 'bg-blue-200',
} satisfies Colors<typeof statuses>

const columns = [
    helper.accessor('id', {
        header: mkHeader(equipmentFieldNames.id),
        cell: v => <Cell className='break-all'>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('name', {
        header: mkHeader(equipmentFieldNames.name),
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('location', {
        header: mkHeader(equipmentFieldNames.location),
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('department', {
        header: mkHeader(equipmentFieldNames.department),
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: mkSelectFilter(departments) },
    }),
    helper.accessor('model', {
        header: mkHeader(equipmentFieldNames.model),
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('serialNumber', {
        header: mkHeader(equipmentFieldNames.serialNumber),
        cell: v => <Cell className='break-all'>
            {v.getValue()}
        </Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('installDate', {
        header: mkHeader(equipmentFieldNames.installDate),
        cell: v => <Cell>{componentsToString(v.getValue())}</Cell>,
        sortingFn: dateSortingFn,
        filterFn: dateFilterFn,
        meta: { filter: dateFilter },
    }),
    helper.accessor('status', {
        header: mkHeader(equipmentFieldNames.status),
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: mkSelectFilter(statuses) },
    }),
    helper.display({
        id: 'actions',
        header: headerCheckbox,
        cell: cellCheckbox,
    }),
]

type Selected = Record<number, boolean>

export default function Component() {
    const data = Z.useStore(store)
    const [selected, setSelected] = R.useState<Selected>({})

    // Tanstack Table docs suggest useMemo, but React doesn't
    // guarantee it won't be recomputed every time.
    const listRef = R.useRef<{ data: typeof data, list: Equipment[] }>(null)
    if(listRef.current == null || listRef.current.data !== data) {
        listRef.current = { data, list: [...data.values()] }
    }
    const list = listRef.current.list

    const table = RT.useReactTable({
        data: list,
        columns,
        state: { rowSelection: selected },
        onRowSelectionChange: setSelected,
        getFilteredRowModel: RT.getFilteredRowModel(),
        getCoreRowModel: RT.getCoreRowModel(),
        getSortedRowModel: RT.getSortedRowModel(),
        enableRowSelection: true,
    })

    return <div>
        <Header path={[]} name='Equipment records'/>
        <Control data={list} selected={selected}/>
        <Table table={table}/>
    </div>
}

function Control({ data, selected }: { data: Equipment[], selected: Selected }) {
    let count = 0
    let commonStatus: Equipment['status'] | '' | null = null
    for(const k in selected) {
        count++
        if(selected[k]) {
            const v = data[k as any].status
            if(commonStatus == null) {
                commonStatus = v
            }
            else if(v !== commonStatus) {
                commonStatus = ''
            }
        }
    }
    commonStatus = commonStatus ?? ''

    const disabled = count == 0

    return <div className='flex text-sm m-4 px-5 py-3 mt-10 max-w-7xl mx-auto rounded-full bg-indigo-100'>
        <div className='grow'>Selected: {count}</div>
        <div className={'flex gap-4' + (disabled ? ' text-gray-600' : '') }>
            <span>Change status:</span>
            <select
                value={commonStatus}
                disabled={disabled}
                onChange={it => {
                    const newStatus = it.target.value as (Equipment['status'] | '')
                    if(newStatus === '') return

                    const newData: Map<Equipment['id'], Equipment> = new Map()
                    for(let i = 0; i < data.length; i++) {
                        let record = data[i]
                        if(selected[i]) {
                            record = { ...record, status: newStatus }
                        }
                        newData.set(record.id, record)
                    }

                    store.setState(newData, true)
                }}
            >
                <option value=''>Select a status</option>
                {statuses.map(it => (
                    <option key={it} value={it}>{it}</option>
                ))}
            </select>
        </div>
    </div>
}

function Table({ table }: { table: RT.Table<Equipment> }) {
    const cellBorder = 'border-t border-t-gray-600'
    const hGroup = table.getHeaderGroups()[0]

    // In tailwind, it would be `grid-cols-[repeat(${hGroup.headers.length},auto)]`
    // but it doesn't work _sometimes_, maybe '@tailwindcss/vite' issue.
    const gridStyle = { gridTemplateColumns: `repeat(${hGroup.headers.length}, auto)` }

    return <div className='text-sm m-4 max-w-7xl mx-auto'>
        <div style={gridStyle} className='w-full grid px-1'>
            {hGroup.headers.map(header => (
                <span key={header.id} className='flex px-3 pt-3'>
                    {RT.flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                </span>
            ))}
            {hGroup.headers.map(header => (
                <span
                    key={header.id}
                    className='flex border-b border-b-gray-600 px-3 pt-2 pb-3'
                >
                    {RT.flexRender(
                        header.column.columnDef.meta?.filter,
                        header.getContext()
                    )}
                </span>
            ))}
            {table.getRowModel().rows.map((row, i) => {
                const status = row.getValue<Equipment['status']>('status')
                const style = statusColors[status] + ' ' + (i ? cellBorder : '')
                return <R.Fragment key={row.id}>
                    {row.getVisibleCells().map(cell => {
                        return <span
                            key={cell.id}
                            className={style + ' flex px-3 py-2'}
                        >
                            {RT.flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </span>
                    })}
                </R.Fragment>
            })}
        </div>
    </div>
}

