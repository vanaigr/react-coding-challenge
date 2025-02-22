import * as R from 'react'

import type { ValuesUnion } from '@/util/types'

const inputContC = ' min-w-xs flex flex-col items-stretch'
const borderC = ' border border-indigo-400 rounded-lg focus-within:outline-2 focus-within:outline-indigo-400'
const errorBorderC = ' border-red-600 focus-within:outline-red-400'
const errorTextC = ' whitespace-nowrap overflow-hidden text-ellipsis w-xs mt-1'
const inputC = ' h-10 w-0 grow border-none outline-none focus:outline-none'
const textC = ' font-sans mb-1'


type InputProps = {
    title: string,
    errors?: string[],
    id_prefix: string,
} & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

function errProps(isError: boolean, error_id: string) {
    if(isError) {
        return {
            'aria-invalid': true,
            'aria-errormessage': error_id,
        }
    }

    return {
        'aria-invalid': false,
    }
}

export function Input({ title, errors, id_prefix, ...rest }: InputProps) {
    const input_id = id_prefix + '_input'
    const error_id = id_prefix + '_error'

    const isError = errors != null && errors.length > 0
    const errorText = isError ? errors.join('. ') : ''
    const errorStyle = isError ? errorBorderC : ''
    const errorProps = errProps(isError, error_id)

    return <div className={inputContC}>
        <label htmlFor={input_id} className={textC}>{title}</label>
        <span className={'flex' + borderC + errorStyle}>
            <input
                id={input_id}
                className={inputC + ' px-4'}
                {...errorProps}
                {...rest}
            />
        </span>
        <span
            className={isError ? errorTextC : ''}
            title={errorText}
            id={error_id}
        >
            {errorText}
        </span>
    </div>
}

type SelectProps<T extends readonly string[]> = {
    title: string,
    options: T,
    optionNames?: readonly string[],
    optionTitles?: readonly string[],
    errors?: string[],
    onChange?: (value: ValuesUnion<T>, event: R.ChangeEvent<HTMLSelectElement>) => void,
    id_prefix: string,
} & Omit<R.DetailedHTMLProps<R.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, 'onChange'>

export function Select<T extends readonly string[]>({
    title,
    options,
    optionTitles,
    optionNames,
    errors,
    onChange,
    id_prefix,
    ...rest
}: SelectProps<T>) {
    const input_id = id_prefix + '_input'
    const error_id = id_prefix + '_error'

    const isError = errors != null && errors.length > 0
    const errorStyle = isError ? errorBorderC : ''
    const errorText = isError ? errors.join('. ') : ''
    const errorProps = errProps(isError, error_id)

    return <span className={inputContC}>
        <label htmlFor={input_id} className={textC}>{title}</label>
        <span className={'flex' + borderC + errorStyle}>
            <select
                className={inputC + ' px-3'}
                id={input_id}
                {...errorProps}
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
            id={error_id}
            className={!isError ? '' : errorTextC}
            title={errorText}
        >
            {errorText}
        </span>
    </span>
}


type EditableListProps = {
    title: string,
    defaultValue: string[],
    onChange: (value: string[]) => void,
    errors?: string[],
    id_prefix: string,
}

export function EditableList(
    { title, defaultValue, onChange, errors, id_prefix }: EditableListProps
) {
    const input_id = id_prefix + '_input'
    const error_id = id_prefix + '_error'

    const [items, setItems] = R.useState(defaultValue)
    const [itemsMeta, setItemsMeta] = R.useState(() => {
        const ids = defaultValue.map((_, i) => i)
        const newId = defaultValue.length
        return { ids, newId }
    })

    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : ' border-red-600'
    const errorText = !isError ? '' : errors.join('. ')
    const errorProps = errProps(isError, error_id)

    const itemComponents = []
    for(let i = items.length - 1; i !== -1; i--) {
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
        <label htmlFor={input_id} className={textC}>{title}</label>
        <div className={'flex flex-col border border-indigo-400 rounded-lg' + errorStyle}>
            <div className={showItems ? 'border-b border-indigo-400' + errorStyle : ''}>
                <NewItem
                    id={input_id}
                    {...errorProps}
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
            id={error_id}
            className={!isError ? '' : errorTextC}
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
    & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>


function NewItem({ onAdd, ...rest }: NewItemProps) {
    const [value, setValue] = R.useState('')
    const disabled = value === ''
    const ref = R.useRef<HTMLInputElement>(null)

    return <div className='h-10 flex items-center gap-3 box-border'>
        <label className='flex grow items-center pl-3'>
            <input
                {...rest}
                ref={ref}
                className='grow'
                type='text'
                onChange={it => setValue(it.target.value)}
                onKeyDown={it => {
                    if(it.key === 'Enter' && !disabled) {
                        it.preventDefault()
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
