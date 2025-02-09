import * as R from 'react'
import * as RT from '@tanstack/react-table'

import {
    type DateComponents,
    toISODate,
    strDateToComponents,
    cmp as dateCmp,
} from '@/util/date'
import DateInput from '@/components/dateInput'


export type CellProps<Element> = R.PropsWithChildren<{}>
    & R.DetailedHTMLProps<R.HTMLAttributes<Element>, Element>

const cellClass = 'px-3 py-3'
export function Cell({ className, children, ...rest }: CellProps<HTMLDivElement>) {
    return <div className={cellClass + ' ' + (className ?? '')} {...rest}>
        {children}
    </div>
}


type HeaderProps<D, V> = R.PropsWithChildren<{
    ctx: RT.HeaderContext<D, V>,
}>

const sortClasses = new Map()
sortClasses.set(false, ' text-gray-500')
sortClasses.set(true, ' text-black')

const headerClass = 'px-3 pt-3'
export function Header<D, V>({ ctx, children }: HeaderProps<D, V>) {
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

export function mkHeader<D, V>(children: string) {
    return (ctx: RT.HeaderContext<D, V>) => <Header ctx={ctx}>{children}</Header>
}


export type InputProps = R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

function Checkbox(props: InputProps) {
    return <label
        className={
            (props.className ?? '')
            + ' grow flex items-center justify-center'
        }
    >
        <input type="checkbox" className='size-3' {...props}/>
    </label>
}

export function cellCheckbox<D, V>(ctx: RT.CellContext<D, V>) {
    const row = ctx.row
    return <Checkbox
        className={cellClass}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
    />
}

export function headerCheckbox<D, V>(ctx: RT.HeaderContext<D, V>) {
    const table = ctx.table

    return <Checkbox
        className={headerClass}
        checked={table.getIsAllRowsSelected()}
        ref={it => {
            if(it == null) return
            // https://stackoverflow.com/a/73790704
            it.indeterminate = table.getIsSomeRowsSelected()
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
    />
}


export function textFilter<D, T extends string>(ctx: RT.HeaderContext<D, T>) {
    return <label className='flex py-2 px-3 grow items-start'>
        <input
            className='grow w-20'
            placeholder='Search'
            value={ctx.column.getFilterValue() as string ?? ''}
            onChange={it => ctx.column.setFilterValue(it.target.value)}
        />
    </label>
}


export function mkSelectFilter<D, T extends string>(values: readonly string[]) {
    const options = values.map(it => {
        return <option className='text-black' key={it} value={it}>{it}</option>
    })

    return (ctx: RT.HeaderContext<D, T>) => {
        const v = values[values.indexOf(ctx.column.getFilterValue() as string)] ?? ''
        return <label className='flex py-2 px-3 grow items-start'>
            <select
                className={'grow w-20' + (v === '' ? ' text-gray-500' : '')}
                value={v}
                onChange={it => ctx.column.setFilterValue(it.target.value)}
            >
                <option value='' className='text-black'>All</option>
                {options}
            </select>
        </label>
    }
}


export type DateFilter = {
    first: DateComponents | null,
    last: DateComponents | null,
}

export function dateSortingFn<T>(rowA: RT.Row<T>, rowB: RT.Row<T>, id: string) {
    const a = rowA.getValue(id) as DateComponents
    const b = rowB.getValue(id) as DateComponents
    return dateCmp(a, b)
}

export function dateFilterFn<T>(row: RT.Row<T>, id: string, filter: any) {
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
}

export function dateFilter<D, T extends DateComponents>(ctx: RT.HeaderContext<D, T>) {
    const v = ctx.column.getFilterValue() as DateFilter | undefined
    let firstV = ''
    let lastV = ''
    if(v != null && v.first != null) {
        firstV = toISODate(v.first)
    }
    if(v != null && v.last != null) {
        lastV = toISODate(v.last)
    }

    return <div className='grow flex pb-3 px-3 flex-col'>
        <div className='grow flex'>
            <DateInput
                defaultValue={firstV}
                className={'w-30 grow ' + (firstV === '' ? 'text-gray-500' : '')}
                onChange={it => {
                    const cs = strDateToComponents(it.target.value)
                    ctx.column.setFilterValue({ ...v, first: cs })
                }}
                placeholder='First'
            />
        </div>
        <div className='grow flex'>
            <DateInput
                placeholder='Last'
                className={'w-30 grow ' + (lastV === '' ? 'text-gray-500' : '')}
                defaultValue={lastV}
                onChange={it => {
                    const cs = strDateToComponents(it.target.value)
                    ctx.column.setFilterValue({ ...v, last: cs })
                }}
            />
        </div>
    </div>
}
