'use client'
import * as R from 'react'
import * as RT from '@tanstack/react-table'

import {
    type MaintenanceRecord,
    types,
    priorities,
    completionStatuses,
    maintenanceFieldNames,
} from '@/data/recordDefs'
import { componentsToString } from '@/util/date'

import {
    TextCell,
    Header,
    TextFilter,
    SelectFilter,
    dateSortingFn,
    dateFilterFn,
    DateFilter,
    numberSortingFn,
    numberFilterFn,
    NumberFilter,
    stringArrFilterFn,
    OpenButton,
} from '@/components/grid'


const cellBorderInsideGroup = 'border-t border-t-gray-400'
const cellBorder = 'border-t border-t-gray-600'
const p = ' px-3 py-2'
const p_left = ' pl-3 py-2'
const p_right = ' pr-3 py-2'
const h = ' px-3 pt-3'
const f = ' px-3 pt-2 pb-3'
const f_top = ' px-3 pt-2'
const f_bot = ' px-3 pb-3'

const helper = RT.createColumnHelper<Entry>()
const columns = [
    helper.accessor('id', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.id}</Header>,
        cell: v => <TextCell className={'break-all' + p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('equipmentId', {
        id: 'equipment-id',
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.equipmentId}</Header>,
        cell: v => {
            const row = v.row

            const openB = <span className={'pl-2 flex' + p_right}>
                <OpenButton url={`/equipment/${row.original.equipmentId}`}/>
            </span>

            if(v.column.getIsGrouped()) {
                return <div title={v.getValue()} className='grow flex'>
                    <button
                        type='button'
                        key={v.cell.id}
                        className={'grow flex gap-2 cursor-pointer' + p_left}
                        onClick={row.getToggleExpandedHandler()}
                    >
                        {row.getIsExpanded() ? '▼' : '▶'}
                        <span>({row.subRows.length})</span>
                        <span className='break-all'>{v.getValue()}</span>
                    </button>
                    {openB}
                </div>
            }
            else {
                return <div title={v.getValue()} className='grow flex'>
                    <TextCell className={'break-all' + p_left} value={v.getValue()}/>
                    {openB}
                </div>
            }
        },
        getGroupingValue: v => v.equipmentId,
        meta: { filter: v => {
            return <div className='grow flex flex-col'>
                <TextFilter ctx={v} className={f_top}/>
                <label className={'pt-2 grow cursor-pointer' + f_bot}>
                    <input
                        type='button'
                        className='cursor-pointer'
                        value={v.column.getIsGrouped() ? 'Ungroup' : 'Group'}
                        onClick={v.column.getToggleGroupingHandler()}
                    />
                </label>
            </div>
        } },
    }),
    helper.accessor('equipment.name', {
        id: 'equipment-name',
        header: v => <Header ctx={v} className={h}>Equipment name</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        aggregatedCell: v => <TextCell className={p} value={v.getValue()}/>,
        aggregationFn: (id, rows) => rows.length == 0 ? '' : rows[0].getValue(id),
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('date', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.date}</Header>,
        cell: v => <TextCell className={p} value={componentsToString(v.getValue())}/>,
        sortingFn: dateSortingFn,
        filterFn: dateFilterFn,
        meta: { filter: v => <DateFilter ctx={v} className={f}/> },
    }),
    helper.accessor('type', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.type}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={types} className={f}/> },
    }),
    helper.accessor('technician', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.technician}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('hoursSpent', {
        id: 'hours-spent',
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.hoursSpent}</Header>,
        cell: v => <TextCell className={p} value={'' + v.getValue()}/>,
        sortingFn: numberSortingFn,
        filterFn: numberFilterFn,
        meta: { filter: v => <NumberFilter ctx={v} className={f}/> },
    }),
    helper.accessor('description', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.description}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('partsReplaced', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.partsReplaced}</Header>,
        enableSorting: false,
        cell: v => <TextCell className={p} value={v.getValue().join(', ')}/>,
        filterFn: stringArrFilterFn,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('priority', {
        id: 'priority',
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.priority}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={priorities} className={f}/> },
    }),
    helper.accessor('completionStatus', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.completionStatus}</Header>,
        cell: v => <TextCell className={p} value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={completionStatuses} className={f}/> },
    }),
    helper.display({
        id: 'open',
        header: '',
        cell: v => <OpenButton
            url={`/maintenance/${v.row.original.id}`}
            className={p}
        />
    }),
]

export type Entry = MaintenanceRecord & { equipment: { name: string } }

export type TableProps = { data: Entry[] }

export function Table({ data }: TableProps) {
    // Can't perform a React state update on a component that hasn't mounted yet:
    // https://github.com/TanStack/table/issues/5026
    const table = RT.useReactTable({
        data,
        columns,
        getFilteredRowModel: RT.getFilteredRowModel(),
        getCoreRowModel: RT.getCoreRowModel(),
        getExpandedRowModel: RT.getExpandedRowModel(),
        getGroupedRowModel: RT.getGroupedRowModel(),
        getSortedRowModel: RT.getSortedRowModel(),
        enableRowSelection: true,
    })

    return <TableDisplay table={table}/>
}

function TableDisplay({ table }: { table: RT.Table<Entry> }) {
    const hGroup = table.getHeaderGroups()[0]

    const columns = hGroup.headers.map(it => {
        if(it.id === 'hours-spent') return '0.5fr'
        if(it.id === 'priority') return '0.7fr'
        if(it.id === 'open') return 'auto'
        return '1fr'
    }).join(' ')

    const gridStyle = { gridTemplateColumns: columns }

    return <div className='text-sm m-4 mt-10 max-w-[120em] mx-auto'>
        <div style={gridStyle} className='w-full grid px-1'>
            {hGroup.headers.map(header =>
                <span key={header.id} className='flex'>
                    {RT.flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                </span>
            )}
            {hGroup.headers.map(header =>
                <span
                    key={header.id}
                    className='flex border-b border-b-gray-600'
                >
                    {RT.flexRender(
                        header.column.columnDef.meta?.filter,
                        header.getContext()
                    )}
                </span>
            )}
            {table.getRowModel().rows.map((row, rowI) =>
                <R.Fragment key={row.id}>
                    {row.getVisibleCells().map(cell =>
                        <Cell
                            key={cell.id}
                            table={table}
                            row={row}
                            cell={cell}
                            visibleI={rowI}
                        />
                    )}
                </R.Fragment>
            )}
        </div>
    </div>
}

type CellProps = {
    table: RT.Table<Entry>
    row: RT.Row<Entry>,
    cell: RT.Cell<Entry, unknown>,
    visibleI: number,
}
function Cell({ table, row, cell, visibleI }: CellProps) {
    const tableGrouped = table.getState().grouping.length > 0

    let style: string
    if(visibleI > 0) {
        if(cell.getIsGrouped() || !tableGrouped || cell.getIsAggregated()) {
            style = cellBorder
        }
        else {
            style = cellBorderInsideGroup
        }
    }
    else {
        style = ''
    }

    if(cell.getIsAggregated()) {
        return <button
            key={cell.id}
            className={style + ' flex items-center'}
            onClick={row.getToggleExpandedHandler()}
        >
            {RT.flexRender(
                cell.column.columnDef.aggregatedCell,
                cell.getContext()
            )}
        </button>
    }
    else if(cell.getIsPlaceholder() && cell.column.id === 'equipment-id') {
        return <div key={cell.id}/>
    }

    if(cell.getIsPlaceholder() || (tableGrouped && cell.column.id === 'equipment-name')) {
        return <div key={cell.id} className={style}/>
    }
    else {
        return <span key={cell.id} className={style + ' flex'}>
            {RT.flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
            )}
        </span>
    }
}
