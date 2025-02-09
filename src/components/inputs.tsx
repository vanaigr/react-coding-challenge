import * as R from 'react'

type InputProps = {
    title: string,
    errors?: string[],
} & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

const inputContC = 'flex flex-col items-stretch'
const inputC = 'border border-indigo-400 rounded-md'
    + ' focus:outline-indigo-400 w-xs h-xs text-lg h-12'

export function Input({ title, errors, ...rest }: InputProps) {
    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : ' border-red-600 focus:outline-red-400'
    const errorText = !isError ? '' : errors.join('. ')

    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <input
            className={inputC + ' px-4' + errorStyle}
            {...rest}
        />
        <span
            className='whitespace-nowrap overflow-hidden text-ellipsis w-xs'
            title={errorText}
        >
            {errorText}
        </span>
    </label>
}

type SelectProps = {
    title: string,
    options: readonly string[],
    errors?: string[],
} & R.DetailedHTMLProps<R.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

export function Select({ title, options, errors, ...rest }: SelectProps) {
    const isError = errors != null && errors.length > 0
    const errorStyle = !isError ? '' : ' border-red-600 focus:outline-red-400'
    const errorText = !isError ? '' : errors.join('. ')

    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <select className={inputC + ' px-3' + errorStyle} {...rest}>
            {options.map(v => (
                <option key={v} value={v}>{v}</option>
            ))}
        </select>
        <span
            className='whitespace-nowrap overflow-hidden text-ellipsis w-xs'
            title={errorText}
        >
            {errorText}
        </span>
    </label>
}
