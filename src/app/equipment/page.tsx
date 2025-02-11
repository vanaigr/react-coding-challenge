'use client'
import * as R from 'react'
import * as Z from 'zustand'
import * as RT from '@tanstack/react-table'

import { type Equipment, departments, statuses, equipmentFieldNames } from '@/data/recordDefs'
import { componentsToString } from '@/util/date'
import { store } from '@/data/equipment'
import PageHeader from '@/components/header'

import {
    TextCell,
    Header,
    OpenButton,
    HeaderCheckbox,
    CellCheckbox,
    TextFilter,
    SelectFilter,
    dateSortingFn,
    dateFilterFn,
    DateFilter,
} from '@/components/grid'

const helper = RT.createColumnHelper<Equipment>()

type Colors<T extends readonly string[]> = { [K in T[number]]: string }
const statusColors = {
    Operational: 'bg-green-200',
    Down: 'bg-red-200',
    Maintenance: 'bg-yellow-200',
    Retired: 'bg-blue-200',
} satisfies Colors<typeof statuses>

const p = ' px-3 py-2'
const h = ' px-3 pt-3'
const f = ' px-3 pt-2 pb-3'

const columns = [
    helper.accessor('id', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.id}</Header>,
        cell: v => <TextCell className={'break-all' + p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('name', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.name}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('location', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.location}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('department', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.department}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={departments} className={f}/> },
    }),
    helper.accessor('model', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.model}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('serialNumber', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.serialNumber}</Header>,
        cell: v => <TextCell className={'break-all' + p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('installDate', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.installDate}</Header>,
        cell: v => <TextCell className={p} value={componentsToString(v.getValue())}/>,
        sortingFn: dateSortingFn,
        filterFn: dateFilterFn,
        meta: { filter: v => <DateFilter ctx={v} className={f}/> },
    }),
    helper.accessor('status', {
        header: v => <Header ctx={v} className={h}>{equipmentFieldNames.status}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={statuses} className={f}/> },
    }),
    helper.display({
        id: 'open',
        header: '',
        cell: v => <OpenButton url={`/equipment/${v.row.original.id}`} className={p}/>
    }),
    helper.display({
        id: 'actions',
        header: v => <HeaderCheckbox ctx={v} className={h}/>,
        cell: v => <CellCheckbox ctx={v} className={p}/>,
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
        <PageHeader path={[]} name='Equipment records'/>
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
                <span key={header.id} className='flex'>
                    {RT.flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                </span>
            ))}
            {hGroup.headers.map(header => (
                <span key={header.id} className='flex border-b border-b-gray-600'>
                    {RT.flexRender(
                        header.column.columnDef.meta?.filter,
                        header.getContext()
                    )}
                </span>
            ))}
            {table.getRowModel().rows.map((row, i) => {
                const status = row.getValue<Equipment['status']>('status')
                const style = 'flex ' + statusColors[status] + ' ' + (i ? cellBorder : '')
                return <R.Fragment key={row.id}>
                    {row.getVisibleCells().map(cell => {
                        return <span key={cell.id} className={style}>
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

