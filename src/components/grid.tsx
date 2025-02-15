import * as R from 'react'
import Link from 'next/link'
import * as RT from '@tanstack/react-table'

import {
    type DateComponents,
    toISODate,
    strDateToComponents,
    cmp as dateCmp,
} from '@/util/date'
import DateInput from '@/components/dateInput'

export type TextCellProps = { className?: string, value: string }
export function TextCell({ className, value }: TextCellProps) {
    return <div
        className={(className ?? '') + ' flex items-center'}
        title={value}
    >
        <div className='grow line-clamp-2'>
            {value}
        </div>
    </div>
}

type HeaderProps<D, V> = R.PropsWithChildren<{
    ctx: RT.HeaderContext<D, V>,
    className?: string,
}>

const sortClasses = new Map()
sortClasses.set(false, ' text-gray-500')
sortClasses.set(true, ' text-black')

export function Header<D, V>({ ctx, children, className }: HeaderProps<D, V>) {
    className ??= ''
    const sorted = ctx.column.getIsSorted()

    return <button
        type='button'
        className={
            className
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

export type OpenButtonProps = {
    url: string,
    className?: string,
}
export function OpenButton(p: OpenButtonProps) {
    return <Link
        className={
            p.className
            + ' flex items-center justify-center cursor-pointer grow text-slate-900'
        }
        href={p.url}
    >
        <span
            className='material-symbols-outlined'
            style={{ fontSize: '1.2em' }}
        >open_in_new</span>
    </Link>
}

export type InputProps = R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

function Checkbox(props: InputProps) {
    const className = props.className ?? ''
    return <label
        className={className + ' grow flex items-center justify-center'}
    >
        <input type="checkbox" className='size-3' {...props}/>
    </label>
}

export type CellCheckboxProps<D, V> = {
    ctx: RT.CellContext<D, V>,
    className?: string,
}
export function CellCheckbox<D, V>(p: CellCheckboxProps<D, V>) {
    const row = p.ctx.row
    return <Checkbox
        className={p.className}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
    />
}

export type HeaderCheckboxPrpos<D, V> = {
    ctx: RT.HeaderContext<D, V>,
    className?: string,
}
export function HeaderCheckbox<D, V>(p: HeaderCheckboxPrpos<D, V>) {
    const table = p.ctx.table

    return <Checkbox
        className={p.className}
        checked={table.getIsAllRowsSelected()}
        ref={it => {
            if(it == null) return
            // https://stackoverflow.com/a/73790704
            it.indeterminate = table.getIsSomeRowsSelected()
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
    />
}

export type TextFilterProps<D> = {
    ctx: RT.HeaderContext<D, string | readonly string[]>,
    className?: string
}
export function TextFilter<D>(p: TextFilterProps<D>) {
    return <label className={(p.className ?? '') + ' flex grow items-start'}>
        <input
            className='grow w-20'
            placeholder='Search'
            value={p.ctx.column.getFilterValue() as string ?? ''}
            onChange={it => p.ctx.column.setFilterValue(it.target.value)}
        />
    </label>
}

export type SelectFilterProps<D, V> = {
    ctx: RT.HeaderContext<D, V>,
    values: readonly string[],
    className?: string;
}
export function SelectFilter<D, V>(p: SelectFilterProps<D, V>) {
    const values = p.values
    const options = values.map(it => {
        return <option className='text-black' key={it} value={it}>{it}</option>
    })

    const v = values[values.indexOf(p.ctx.column.getFilterValue() as string)] ?? ''
    return <label className={(p.className ?? '') + ' flex grow items-start'}>
        <select
            className={'grow w-20' + (v === '' ? ' text-gray-500' : '')}
            value={v}
            onChange={it => p.ctx.column.setFilterValue(it.target.value)}
        >
            <option value='' className='text-black'>All</option>
            {options}
        </select>
    </label>
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

export type DateFilterProps<D> = {
    ctx: RT.HeaderContext<D, DateComponents>,
    className?: string,
}
export function DateFilter<D>(p: DateFilterProps<D>) {
    const v = p.ctx.column.getFilterValue() as DateFilter | undefined
    let firstV = ''
    let lastV = ''
    if(v != null && v.first != null) {
        firstV = toISODate(v.first)
    }
    if(v != null && v.last != null) {
        lastV = toISODate(v.last)
    }

    return <div className={(p.className ?? '') + ' grow flex flex-col'}>
        <div className='grow flex'>
            <DateInput
                defaultValue={firstV}
                className={'w-30 grow ' + (firstV === '' ? 'text-gray-500' : '')}
                onChange={it => {
                    const cs = strDateToComponents(it.target.value)
                    p.ctx.column.setFilterValue({ ...v, first: cs })
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
                    p.ctx.column.setFilterValue({ ...v, last: cs })
                }}
            />
        </div>
    </div>
}


// there's inNumberRange, but docs aren't clear about types

export type NumbersFilter = {
    first: number | null,
    last: number | null,
}

export function numberSortingFn<T>(rowA: RT.Row<T>, rowB: RT.Row<T>, id: string) {
    const a = rowA.getValue(id) as number
    const b = rowB.getValue(id) as number
    return a - b
}

export function numberFilterFn<T>(row: RT.Row<T>, id: string, filter: any) {
    const f = filter as NumbersFilter | undefined
    if(f == null) return true

    const a = row.getValue(id) as number
    if(f.first != null) {
        if(a < f.first) return false
    }
    if(f.last != null) {
        if(a > f.last) return false
    }

    return true
}

export type NumberFilterProps<D> = {
    ctx: RT.HeaderContext<D, number>,
    className?: string,
}
export function NumberFilter<D>(p: NumberFilterProps<D>) {
    const v = p.ctx.column.getFilterValue() as NumbersFilter | undefined
    let firstV = ''
    let lastV = ''
    if(v != null && v.first != null) {
        firstV = '' + v.first
    }
    if(v != null && v.last != null) {
        lastV = '' + v.last
    }

    return <div className={(p.className ?? '') + ' grow flex flex-col'}>
        <div className='grow flex'>
            <input
                type='number'
                defaultValue={firstV}
                className={'w-10 grow ' + (firstV === '' ? 'text-gray-500' : '')}
                onChange={it => {
                    const cs = parseFloat(it.target.value)
                    p.ctx.column.setFilterValue({ ...v, first: cs })
                }}
                placeholder='First'
            />
        </div>
        <div className='grow flex'>
            <input
                type='number'
                placeholder='Last'
                className={'w-10 grow ' + (lastV === '' ? 'text-gray-500' : '')}
                defaultValue={lastV}
                onChange={it => {
                    const cs = parseFloat(it.target.value)
                    p.ctx.column.setFilterValue({ ...v, last: cs })
                }}
            />
        </div>
    </div>
}

// includes if the for any item in the array, item.includes(filter)
export function stringArrFilterFn<T>(row: RT.Row<T>, id: string, filter: any) {
    let f = filter as string | undefined
    if(f == null) return true
    f = f.toLowerCase()

    const arr = row.getValue(id) as string[]
    for(let i = 0; i < arr.length; i++) {
        // This should be case folded for e.g. Greek ς, but TC39 doesn't care?
        if(arr[i].toLowerCase().includes(f)) return true
    }

    return false
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

export function Controls<T>({ table }: { table: RT.Table<T> }) {
    const gotoPageRef = R.useRef<HTMLInputElement | null>(null)

    const curPageI = table.getState().pagination.pageIndex
    const pageC = table.getPageCount()

    return <>
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
    </>
}

export function ControlsCont<T>({ children }: R.PropsWithChildren<{}>) {
    return <div
        className='flex text-sm m-4 px-5 py-3 mt-10 max-w-[90rem] mx-auto rounded-full bg-indigo-100 items-center'
    >
        {children}
    </div>

}
