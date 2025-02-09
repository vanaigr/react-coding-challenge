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

import {
    TextCell,
    mkHeader,
    textFilter,
    mkSelectFilter,
    dateSortingFn,
    dateFilterFn,
    dateFilter,
    numberSortingFn,
    numberFilterFn,
    numberFilter,
    stringArrFilterFn,
} from '@/components/grid'

type Entry = { maintenance: MaintenanceRecord, equipment: Equipment }

const helper = RT.createColumnHelper<Entry>()

const columns = [
    helper.accessor('maintenance.id', {
        header: mkHeader(maintenanceFieldNames.id),
        cell: v => <TextCell className='break-all' value={v.getValue()}/>,
        meta: { filter: textFilter },
    }),
    helper.accessor('maintenance.equipmentId', {
        header: mkHeader(maintenanceFieldNames.equipmentId),
        cell: v => <TextCell className='break-all' value={v.getValue()}/>,
        meta: { filter: textFilter },
    }),
    helper.accessor('equipment.name', {
        header: mkHeader('Equipment name'),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: textFilter },
    }),
    helper.accessor('maintenance.date', {
        header: mkHeader(maintenanceFieldNames.date),
        cell: v => <TextCell value={componentsToString(v.getValue())}/>,
        sortingFn: dateSortingFn,
        filterFn: dateFilterFn,
        meta: { filter: dateFilter },
    }),
    helper.accessor('maintenance.type', {
        header: mkHeader(maintenanceFieldNames.type),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: mkSelectFilter(types) },
    }),
    helper.accessor('maintenance.technician', {
        header: mkHeader(maintenanceFieldNames.technician),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: textFilter },
    }),
    helper.accessor('maintenance.hoursSpent', {
        header: mkHeader(maintenanceFieldNames.hoursSpent),
        cell: v => <TextCell value={'' + v.getValue()}/>,
        sortingFn: numberSortingFn,
        filterFn: numberFilterFn,
        meta: { filter: numberFilter },
    }),
    helper.accessor('maintenance.description', {
        header: mkHeader(maintenanceFieldNames.description),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: textFilter },
    }),
    helper.accessor('maintenance.partsReplaced', {
        header: mkHeader(maintenanceFieldNames.partsReplaced),
        enableSorting: false,
        cell: v => <TextCell value={v.getValue().join(', ')}/>,
        filterFn: stringArrFilterFn,
        meta: { filter: textFilter },
    }),
    helper.accessor('maintenance.priority', {
        header: mkHeader(maintenanceFieldNames.priority),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: mkSelectFilter(priorities) },
    }),
    helper.accessor('maintenance.completionStatus', {
        header: mkHeader(maintenanceFieldNames.completionStatus),
        cell: v => <TextCell value={v.getValue()}/>,
        meta: { filter: mkSelectFilter(completionStatuses) },
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
        getSortedRowModel: RT.getSortedRowModel(),
        enableRowSelection: true,
    })

    return <div>
        <Table table={table}/>
    </div>
}

function Table({ table }: { table: RT.Table<Entry> }) {
    const cellBorder = 'border-t border-t-gray-600'
    const hGroup = table.getHeaderGroups()[0]

    // In tailwind, it would be `grid-cols-[repeat(${hGroup.headers.length},auto)]`
    // but it doesn't work _sometimes_, maybe '@tailwindcss/vite' issue.
    const gridStyle = { gridTemplateColumns: `repeat(${hGroup.headers.length}, auto)` }

    return <div className='text-sm m-4 max-w-[120em] mx-auto'>
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
                const style = (i ? cellBorder : '')
                return <R.Fragment key={row.id}>
                    {row.getVisibleCells().map(cell => {
                        return <span
                            key={cell.id}
                            className={style + ' flex '}
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

