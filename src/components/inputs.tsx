import * as R from 'react'

import type { ValuesUnion } from '@/util/types'

const inputContC = ' flex flex-col items-stretch'
const borderC = ' border border-indigo-400 rounded-md focus-within:outline-2 focus-within:outline-indigo-400'
const errorBorderC = ' border-red-600 focus-within:outline-red-400'
const inputC = ' text-lg h-12 w-0 grow border-none outline-none focus:outline-none'


type InputProps = {
    title: string,
    errors?: string[],
} & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export function Input({ title, errors, ...rest }: InputProps) {
    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : errorBorderC
    const errorText = !isError ? '' : errors.join('. ')

    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <span className={'flex' + borderC + errorStyle}>
            <input
                className={inputC + ' px-4'}
                {...rest}
            />
        </span>
        <span
            className='whitespace-nowrap overflow-hidden text-ellipsis w-xs'
            title={errorText}
        >
            {errorText}
        </span>
    </label>
}

type SelectProps<T extends readonly string[]> = {
    title: string,
    options: T,
    optionNames?: readonly string[],
    optionTitles?: readonly string[],
    errors?: string[],
    onChange?: (value: ValuesUnion<T>, event: R.ChangeEvent<HTMLSelectElement>) => void,
} & Omit<R.DetailedHTMLProps<R.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, 'onChange'>

export function Select<T extends readonly string[]>({
    title,
    options,
    optionTitles,
    optionNames,
    errors,
    onChange,
    ...rest
}: SelectProps<T>) {
    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : errorBorderC
    const errorText = !isError ? '' : errors.join('. ')

    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <span className={'flex' + borderC + errorStyle}>
            <select
                className={inputC + ' px-3'}
                {...rest}
                onChange={onChange && ((ev) => onChange(ev.target.value as ValuesUnion<T>, ev))}
            >
                {options.map((v, i) => (
                    <option title={optionTitles?.[i]} key={v} value={v}>
                        {optionNames?.[i] ?? v}
                    </option>
                ))}
            </select>
        </span>
        <span
            className='whitespace-nowrap overflow-hidden text-ellipsis w-xs'
            title={errorText}
        >
            {errorText}
        </span>
    </label>
}


type EditableListProps = {
    title: string,
    defaultValue: string[],
    onChange: (value: string[]) => void,
    errors?: string[],
}

export function EditableList({ title, defaultValue, onChange, errors }: EditableListProps) {
    const [items, setItems] = R.useState(defaultValue)
    const [itemsMeta, setItemsMeta] = R.useState(() => {
        const ids = defaultValue.map((_, i) => i)
        const newId = defaultValue.length
        return { ids, newId }
    })

    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : ' border-red-600'
    const errorText = !isError ? '' : errors.join('. ')

    const itemComponents = []
    for(let i = items.length - 1; i != -1; i--) {
        const it = items[i]
        itemComponents.push(<Item
            key={itemsMeta.ids[i]}
            defaultValue={it}
            onChange={ev => {
                const newItems = items.slice()
                newItems[i] = ev.target.value
                setItems(newItems)
                onChange(newItems)
            }}
            onDelete={() => {
                const newItems = items.slice()
                newItems.splice(i, 1)
                const newIds = itemsMeta.ids.slice()
                newIds.splice(i, 1)

                setItems(newItems)
                setItemsMeta({ ...itemsMeta, ids: newIds })
                onChange(newItems)
            }}
        />)
    }
    const showItems = itemComponents.length > 0

    return <div className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <div className={'flex flex-col border border-indigo-400 rounded-md' + errorStyle}>
            <div className={showItems ? 'border-b border-indigo-400' + errorStyle : ''}>
                <NewItem
                    onAdd={value => {
                        const newItems = items.slice()
                        newItems.push(value)

                        const newIds = itemsMeta.ids.slice()
                        const newNewId = itemsMeta.newId + 1
                        newIds.push(itemsMeta.newId)

                        setItems(newItems)
                        setItemsMeta({ ids: newIds, newId: newNewId })
                        onChange(newItems)
                    }}
                />
            </div>
            {showItems &&
                <div className='flex flex-col py-1.5'>
                    {itemComponents}
                </div>
            }
        </div>
        <span
            className='whitespace-nowrap overflow-hidden text-ellipsis w-xs'
            title={errorText}
        >
            {errorText}
        </span>
    </div>
}

type ItemProps = {
    defaultValue: string,
    onChange: R.ChangeEventHandler<HTMLInputElement>,
    onDelete: () => void,
}

function Item({ defaultValue, onChange, onDelete }: ItemProps) {
    return <div className='flex items-center gap-3 px-3'>
        <label className='flex grow py-1.5'>
            <input
                className='grow'
                type='text'
                defaultValue={defaultValue}
                onChange={onChange}
            />
        </label>
        <button
            type='button'
            className={'material-symbols-outlined cursor-pointer py-1.5'}
            onClick={onDelete}
        >delete</button>
    </div>
}

type NewItemProps = { onAdd: (value: string) => void }

function NewItem({ onAdd }: NewItemProps) {
    const [value, setValue] = R.useState('')
    const disabled = value === ''
    const ref = R.useRef<HTMLInputElement>(null)

    return <div className='h-12 flex items-center gap-3 box-border'>
        <label className='flex grow items-center pl-3'>
            <input
                ref={ref}
                className='grow'
                type='text'
                onChange={it => setValue(it.target.value)}
                onKeyDown={it => {
                    if(it.key === 'Enter' && !disabled) {
                        onAdd(value)
                        setValue('')
                        if(ref.current) ref.current.value = ''
                    }
                }}
            />
        </label>
        <button
            type='button'
            className={
                'material-symbols-outlined pr-3'
                + (disabled ? ' text-gray-500' : ' cursor-pointer')
            }
            disabled={disabled}
            onClick={() => {
                onAdd(value)
                setValue('')
                if(ref.current) ref.current.value = ''
            }}
        >add</button>
    </div>
}
