'use client'
import * as R from 'react'
import * as RT from '@tanstack/react-table'

import { type Equipment, departments, statuses, equipmentFieldNames } from '@/data/recordDefs'
import { componentsToString } from '@/util/date'
import { updateStatuses } from './action'

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


type Colors<T extends readonly string[]> = { [K in T[number]]: string }
const statusColors = {
    Operational: 'bg-lime-200',
    Down: 'bg-red-200',
    Maintenance: 'bg-yellow-200',
    Retired: 'bg-blue-200',
} satisfies Colors<typeof statuses>

const p = ' px-3 py-2'
const h = ' px-3 pt-3'
const f = ' px-3 pt-2 pb-3'

const helper = RT.createColumnHelper<Equipment>()
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

export type Entry = Equipment
export type TableProps = { data: Entry[] }

export function Table({ data }: TableProps) {
    const [pagination, setPagination] = R.useState({ pageIndex: 0, pageSize: 10 })
    const [selected, setSelected] = R.useState<Selected>({})

    const table = RT.useReactTable({
        data,
        columns,
        state: { rowSelection: selected, pagination },
        onRowSelectionChange: setSelected,
        getFilteredRowModel: RT.getFilteredRowModel(),
        getCoreRowModel: RT.getCoreRowModel(),
        getSortedRowModel: RT.getSortedRowModel(),
        getPaginationRowModel: RT.getPaginationRowModel(),
        enableRowSelection: true,
        onPaginationChange: setPagination,
    })

    return <div>
        <Control data={data} selected={selected} table={table}/>
        <TableDisplay table={table}/>
    </div>
}

type CbProps = {
    title: string
    text: string
    enabled: boolean
    onClick: () => void
}
function Cb({ title, text, enabled, onClick }: CbProps) {
    return <div className='flex items-center'>
        <button
            onClick={() => enabled && onClick()}
            disabled={!enabled}
            type='button'
            className={'material-symbols-outlined' + (enabled ? '' : ' text-gray-500')}
            title={title}
        >
            {text}
        </button>
    </div>

}

type ControlProps = { data: Equipment[], selected: Selected, table: RT.Table<Equipment> }

function Control({ data, selected, table }: ControlProps) {
    const gotoPageRef = R.useRef<HTMLInputElement | null>(null)

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

    const curPageI = table.getState().pagination.pageIndex
    const pageC = table.getPageCount()

    const [updateStatus, setUpdateStatus] = R.useState<'none' | 'sending'>('none')
    const disabled = count == 0
    const ariaDisabled = updateStatus !== 'none'

    return <div className='flex text-sm m-4 px-5 py-3 mt-10 max-w-[90rem] mx-auto rounded-full bg-indigo-100 items-center'>
        <div>Selected: {count} of {table.getRowCount()}</div>
        <div className='w-6'/>
        <div>
            Page: {1 + curPageI} of {pageC}
        </div>
        <div className='w-2'/>
        <Cb
            title='Go to first page'
            text='stat_2'
            enabled={curPageI > 0}
            onClick={() => table.setPageIndex(0)}
        />
        <Cb
            title='Go to previous page'
            text='stat_1'
            enabled={curPageI > 0}
            onClick={() => table.setPageIndex(curPageI - 1)}
        />
        <Cb
            title='Go to next page'
            text='stat_minus_1'
            enabled={curPageI < pageC - 1}
            onClick={() => table.setPageIndex(curPageI + 1)}
        />
        <Cb
            title='Go to last page'
            text='stat_minus_2'
            enabled={curPageI < pageC - 1}
            onClick={() => table.setPageIndex(pageC - 1)}
        />
        <div className='w-6'/>
        <div>
            Go to page
            {' '}
            <input
                ref={gotoPageRef}
                type='number'
                min={1}
                max={table.getPageCount()}
                defaultValue={1}
            />
            {' '}
            <button
                onClick={() => {
                    if(!gotoPageRef.current) return
                    let page = parseInt(gotoPageRef.current.value)
                    if(!isFinite(page)) return
                    page = Math.min(Math.max(1, page), pageC) - 1
                    table.setPageIndex(page)
                }}
            >Go</button>
        </div>
        <div className='grow'/>
        <div className={'flex gap-4' + (disabled || ariaDisabled ? ' text-gray-600' : '') }>
            <span>Change status:</span>
            <select
                value={commonStatus}
                disabled={disabled}
                aria-disabled={ariaDisabled}
                onChange={async(it) => {
                    if(disabled || ariaDisabled) return
                    const newStatus = it.target.value as (Equipment['status'] | '')
                    if(newStatus === '') return

                    setUpdateStatus('sending')
                    try {
                        const ids: string[] = []
                        for(const index in selected) {
                            if(!selected[index]) continue
                            ids.push(data[index].id)
                        }

                        await updateStatuses(ids, newStatus)
                    }
                    catch(err) {
                        console.error(err)
                    }
                    finally {
                        setUpdateStatus('none')
                    }
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

function TableDisplay({ table }: { table: RT.Table<Equipment> }) {
    const cellBorder = 'border-t border-t-gray-600'
    const hGroup = table.getHeaderGroups()[0]

    const gridStyle = { gridTemplateColumns: `repeat(${hGroup.headers.length}, auto)` }

    return <div className='text-sm m-8 max-w-[90rem] mx-auto'>
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
