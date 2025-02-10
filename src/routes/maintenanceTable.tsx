import * as R from 'react'
import * as Z from 'zustand'
import * as RT from '@tanstack/react-table'

import {
    type Equipment,
    type MaintenanceRecord,
    types,
    priorities,
    completionStatuses,
    maintenanceFieldNames,
} from '@/data/recordDefs'
import { componentsToString } from '@/util/date'
import { store as maintenanceStore } from '@/data/maintenance'
import { store as equipmentStore } from '@/data/equipment'
import PageHeader from '@/components/header'

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
} from '@/components/grid'

type Entry = { maintenance: MaintenanceRecord, equipment: Equipment }

const helper = RT.createColumnHelper<Entry>()

const cellBorder = 'border-t border-t-gray-600'
const p = ' px-3 py-2'
const h = ' px-3 pt-3'
const f = ' px-3 pt-2 pb-3'
const f_top = ' px-3 pt-2'
const f_bot = ' px-3 pb-3'

const columns = [
    helper.accessor('maintenance.id', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.id}</Header>,
        cell: v => <TextCell className={'break-all' + p} value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.equipmentId', {
        id: 'equipment-id',
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.equipmentId}</Header>,
        cell: v => {
            if(v.column.getIsGrouped()) {
                const row = v.row

                return <button
                    key={v.cell.id}
                    className={'flex gap-2 cursor-pointer' + p}
                    onClick={row.getToggleExpandedHandler()}
                >
                    {row.getIsExpanded() ? '▼' : '▶'}
                    <span>({row.subRows.length})</span>
                    <TextCell className='break-all' value={v.getValue()}/>
                </button>
            }
            else {
                return <TextCell className={'break-all' + p} value={v.getValue()}/>
            }
        },
        getGroupingValue: v => v.maintenance.equipmentId,
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
        cell: v => <TextCell value={v.getValue()}/>,
        aggregatedCell: v => <TextCell value={v.getValue()}/>,
        aggregationFn: (id, rows) => rows.length == 0 ? '' : rows[0].getValue(id),
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.date', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.date}</Header>,
        cell: v => <TextCell value={componentsToString(v.getValue())}/>,
        sortingFn: dateSortingFn,
        filterFn: dateFilterFn,
        meta: { filter: v => <DateFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.type', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.type}</Header>,
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={types} className={f}/> },
    }),
    helper.accessor('maintenance.technician', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.technician}</Header>,
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.hoursSpent', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.hoursSpent}</Header>,
        cell: v => <TextCell value={'' + v.getValue()}/>,
        sortingFn: numberSortingFn,
        filterFn: numberFilterFn,
        meta: { filter: v => <NumberFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.description', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.description}</Header>,
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.partsReplaced', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.partsReplaced}</Header>,
        enableSorting: false,
        cell: v => <TextCell value={v.getValue().join(', ')}/>,
        filterFn: stringArrFilterFn,
        meta: { filter: v => <TextFilter ctx={v} className={f}/> },
    }),
    helper.accessor('maintenance.priority', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.priority}</Header>,
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={priorities} className={f}/> },
    }),
    helper.accessor('maintenance.completionStatus', {
        header: v => <Header ctx={v} className={h}>{maintenanceFieldNames.completionStatus}</Header>,
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: v => <SelectFilter ctx={v} values={completionStatuses} className={f}/> },
    }),
]

type Selected = Record<number, boolean>

export default function Component() {
    const equipment = Z.useStore(equipmentStore)
    const data = Z.useStore(maintenanceStore)
    const [selected, setSelected] = R.useState<Selected>({})

    // Tanstack Table docs suggest useMemo, but React doesn't
    // guarantee it won't be recomputed every time.
    const listRef = R.useRef<{ data: typeof data, list: Entry[] }>(null)
    if(listRef.current == null || listRef.current.data !== data) {
        const list: Entry[] = []
        for(const v of data.values()) {
            list.push({ maintenance: v, equipment: equipment.get(v.equipmentId)! })
        }

        listRef.current = { data, list: list }
    }
    const list = listRef.current.list

    const table = RT.useReactTable({
        data: list,
        columns,
        state: { rowSelection: selected },
        onRowSelectionChange: setSelected,
        getFilteredRowModel: RT.getFilteredRowModel(),
        getCoreRowModel: RT.getCoreRowModel(),
        getExpandedRowModel: RT.getExpandedRowModel(),
        getGroupedRowModel: RT.getGroupedRowModel(),
        getSortedRowModel: RT.getSortedRowModel(),
        enableRowSelection: true,
    })

    return <div>
        <PageHeader path={[]} name='Maintenance records'/>
        <Table table={table}/>
    </div>
}

function Table({ table }: { table: RT.Table<Entry> }) {
    const cellBorderInsideGroup = 'border-t border-t-gray-400'
    const hGroup = table.getHeaderGroups()[0]

    const gridStyle = { gridTemplateColumns: `repeat(${hGroup.headers.length}, 1fr)` }

    return <div className='text-sm m-4 mt-10 max-w-[120em] mx-auto'>
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
                <span
                    key={header.id}
                    className='flex border-b border-b-gray-600'
                >
                    {RT.flexRender(
                        header.column.columnDef.meta?.filter,
                        header.getContext()
                    )}
                </span>
            ))}
            {table.getRowModel().rows.map(row => {
                const cells = row.getVisibleCells().map(cell => {
                    const tableGrouped = table.getState().grouping.length > 0

                    let style: string
                    if(row.index > 0) {
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
                })

                return <R.Fragment key={row.id}>{cells}</R.Fragment>
            })}
        </div>
    </div>
}

