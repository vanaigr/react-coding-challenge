import * as R from 'react'
import * as Z from 'zustand'
import * as RT from '@tanstack/react-table'

import { Equipment, departments, statuses } from '@/data/records'
import {
    cmp as dateCmp,
    toISODate,
    strDateToComponents,
    type DateComponents,
} from '@/util/date'
import DateInput from '@/components/dateInput'

function componentsToString(v: DateComponents) {
    const format = new Intl.DateTimeFormat()
    return format.format(new Date(v[0], v[1] - 1, v[2]))
}

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RT.RowData, TValue> {
        filter: (ctx: RT.HeaderContext<Equipment, TValue>) => R.ReactElement
    }
}

const helper = RT.createColumnHelper<Equipment>()

type Colors<T extends readonly string[]> = { [K in T[number]]: string }
const statusColors = {
    Operational: 'bg-green-200',
    Down: 'bg-red-200',
    Maintenance: 'bg-yellow-200',
    Retired: 'bg-blue-200',
} satisfies Colors<typeof statuses>

type CellProps<Element> = R.PropsWithChildren<{}>
    & R.DetailedHTMLProps<R.HTMLAttributes<Element>, Element>

const cellClass = 'px-3 py-3'
function Cell({ className, children, ...rest }: CellProps<HTMLDivElement>) {
    return <div className={cellClass + ' ' + (className ?? '')} {...rest}>
        {children}
    </div>
}

type HeaderProps<T> = R.PropsWithChildren<{
    ctx: RT.HeaderContext<Equipment, T>,
}>

const sortClasses = new Map()
sortClasses.set(false, ' text-gray-500')
sortClasses.set(true, ' text-black')

const headerClass = 'px-3 pt-3'
function Header<T>({ ctx, children }: HeaderProps<T>) {
    const sorted = ctx.column.getIsSorted()

    return <button
        type='button'
        className={
            headerClass
                + ' upper font-bold text-gray-700 flex items-center gap-2'
                + ' cursor-pointer grow'
        }
        onClick={ctx.column.getToggleSortingHandler()}
    >
        <div className='grow text-left'>
            {children}
        </div>
        {ctx.column.getCanSort() &&
            <div className='text-[0.5em] leading-none flex flex-col'>
                <span className={sortClasses.get(sorted === 'asc')}>▲</span>
                <span className={sortClasses.get(sorted === 'desc')}>▼</span>
            </div>
        }
    </button>
}

type InputProps = R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
function CellCheckbox(props: InputProps) {
    return <label
        className={
            (props.className ?? '')
            + ' grow flex items-center justify-center'
        }
    >
        <input type="checkbox" className='size-3' {...props}/>
    </label>
}

function textFilter<T extends string>(ctx: RT.HeaderContext<Equipment, T>) {
    return <label className='flex py-2 px-3 grow items-start'>
        <input
            className='grow w-0'
            placeholder='Search'
            value={ctx.column.getFilterValue() as string ?? ''}
            onChange={it => ctx.column.setFilterValue(it.target.value)}
        />
    </label>
}

function mkSelectFilter<T extends string>(values: readonly string[]) {
    const options = values.map(it => {
        return <option className='text-black' key={it} value={it}>{it}</option>
    })

    return (ctx: RT.HeaderContext<Equipment, T>) => {
        const v = values[values.indexOf(ctx.column.getFilterValue() as string)] ?? ''
        return <label className='flex py-2 px-3 grow items-start'>
            <select
                className={'grow w-0' + (v === '' ? ' text-gray-500' : '')}
                value={v}
                onChange={it => ctx.column.setFilterValue(it.target.value)}
            >
                <option value='' className='text-black'>All</option>
                {options}
            </select>
        </label>
    }
}

type DateFilter = {
    first: DateComponents | null,
    last: DateComponents | null,
}

const columns = [
    helper.accessor('id', {
        header: v => <Header ctx={v}>Id</Header>,
        cell: v => <Cell className='break-all'>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('name', {
        header: (v) => <Header ctx={v}>Name</Header>,
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('location', {
        header: (v) => <Header ctx={v}>Location</Header>,
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('department', {
        header: (v) => <Header ctx={v}>Department</Header>,
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: mkSelectFilter(departments) },
    }),
    helper.accessor('model', {
        header: (v) => <Header ctx={v}>Model</Header>,
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('serialNumber', {
        header: (v) => <Header ctx={v}>Serial number</Header>,
        cell: v => <Cell className='break-all'>
            {v.getValue()}
        </Cell>,
        meta: { filter: textFilter },
    }),
    helper.accessor('installDate', {
        header: (v) => <Header ctx={v}>Install date</Header>,
        cell: v => <Cell>{componentsToString(v.getValue())}</Cell>,
        sortingFn: (rowA, rowB, id) => {
            const a = rowA.getValue(id) as DateComponents
            const b = rowB.getValue(id) as DateComponents
            return dateCmp(a, b)
        },
        filterFn: (row, id, filter) => {
            const f = filter as DateFilter | undefined
            if(f == null) return true

            const a = row.getValue(id) as DateComponents
            if(f.first != null) {
                if(dateCmp(a, f.first) < 0) return false
            }
            if(f.last != null) {
                if(dateCmp(a, f.last) > 0) return false
            }

            return true
        },
        meta: {
            filter: ctx => {
                const v = ctx.column.getFilterValue() as DateFilter | undefined
                let firstV = ''
                let lastV = ''
                if(v != null && v.first != null) {
                    firstV = toISODate(v.first)
                }
                if(v != null && v.last != null) {
                    lastV = toISODate(v.last)
                }

                return <div className='flex pb-3 px-3 flex-col'>
                    <div className='flex flex-col'>
                        <DateInput
                            defaultValue={firstV}
                            className={firstV === '' ? 'text-gray-500' : ''}
                            onChange={it => {
                                const cs = strDateToComponents(it.target.value)
                                ctx.column.setFilterValue({ ...v, first: cs })
                            }}
                            placeholder='First'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <DateInput
                            placeholder='Last'
                            className={lastV === '' ? 'text-gray-500' : ''}
                            defaultValue={lastV}
                            onChange={it => {
                                const cs = strDateToComponents(it.target.value)
                                ctx.column.setFilterValue({ ...v, last: cs })
                            }}
                        />
                    </div>
                </div>
            },
        },
    }),
    helper.accessor('status', {
        header: (v) => <Header ctx={v}>Status</Header>,
        cell: v => <Cell>{v.getValue()}</Cell>,
        meta: { filter: mkSelectFilter(statuses) },
    }),
    helper.display({
        id: 'actions',
        header: ({ table }) => {
            return <CellCheckbox
                className={headerClass}
                checked={table.getIsAllRowsSelected()}
                ref={it => {
                    if(it == null) return
                    // https://stackoverflow.com/a/73790704
                    it.indeterminate = table.getIsSomeRowsSelected()
                }}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        },
        cell: ({ row }) => {
            return <CellCheckbox
                className={cellClass}
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
            />
        }
    }),
]

type State = {
    data: Array<Equipment>,
    selected: RT.RowSelectionState,
}

export default function Component() {
    const store = R.useState(() => {
        return Z.create<State>(() => ({ data: exampleData, selected: {} }))
    })[0]

    const state = store()

    const table = RT.useReactTable({
        data: state.data,
        columns,
        state: {
            rowSelection: state.selected,
        },
        onRowSelectionChange: updater => {
            if(typeof updater === 'function') {
                store.setState(it => ({ selected: updater(it.selected) }))
            }
            else {
                store.setState({ selected: updater })
            }
        },
        getFilteredRowModel: RT.getFilteredRowModel(),
        getCoreRowModel: RT.getCoreRowModel(),
        getSortedRowModel: RT.getSortedRowModel(),
        enableRowSelection: true,
    })

    return <div>
        <Control store={store}/>
        <Table table={table}/>
    </div>
}

function Control({ store }: { store: Z.UseBoundStore<Z.StoreApi<State>> }) {
    const { selected, data } = store()

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

    return <div className='flex text-sm m-4 px-5 py-3 max-w-7xl mx-auto rounded-full bg-indigo-100'>
        <div className='grow'>Selected: {count}</div>
        <div className={'flex gap-4' + (disabled ? ' text-gray-600' : '') }>
            <span>Change status:</span>
            <select
                value={commonStatus}
                disabled={disabled}
                onChange={it => {
                    const newStatus = it.target.value as (Equipment['status'] | '')
                    if(newStatus === '') return

                    const newData: typeof data = []
                    for(let i = 0; i < data.length; i++) {
                        let record = data[i]
                        if(selected[i]) {
                            record = { ...record, status: newStatus }
                        }
                        newData[i] = record
                    }

                    store.setState({ data: newData })
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

    return <div
        className='text-sm m-4 max-w-7xl mx-auto'
    >
        <div
            className={
                'w-full grid px-1'
                + ` grid-cols-[repeat(${hGroup.headers.length},auto)]`
            }
        >
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
                const style = statusColors[status] + ' ' + (i ? cellBorder : '')
                return row.getVisibleCells().map(cell => {
                    return <span
                        key={cell.id}
                        className={style + ' flex '}
                    >
                        {RT.flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </span>
                })
            })}
        </div>
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
        'name': 'name 7',
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
