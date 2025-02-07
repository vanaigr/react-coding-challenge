import * as R from 'react'
import * as Z from 'zustand'
import { z } from 'zod'

import { dateValidation } from '@/util/date'

type InputProps = {
    title: string,
    errors?: string[],
} & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

const inputContC = 'flex flex-col items-stretch'
const inputC = 'border border-indigo-400 rounded-md'
    + ' focus:outline-indigo-400 w-xs h-xs text-lg h-12'

function Input({ title, errors, ...rest }: InputProps) {
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

function Select({ title, options, errors, ...rest }: SelectProps) {
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

const departments = ['Machining', 'Assembly', 'Packaging', 'Shipping'] as const
const statuses = ['Operational', 'Down', 'Maintenance', 'Retired'] as const

const equipmentRecordValidation = z.object({
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.string().pipe(z.enum(departments)),
    model: z.string().nonempty('Must not be empty'),
    serialNumber: z.string().regex(/^[\p{L}\p{N}]+$/u, 'Must be alphanumeric'),
    installDate: z.string().pipe(dateValidation),
    status: z.string().pipe(z.enum(statuses)),
})

export type Input = z.input<typeof equipmentRecordValidation>
export type EquipmentRecord = z.infer<typeof equipmentRecordValidation>

export type FormData = {
    input: Input,
    result: z.SafeParseReturnType<Input, EquipmentRecord>,
}

export function createFormData(input: Input): FormData {
    const result = equipmentRecordValidation.safeParse(input)
    return { input, result }
}

export default function() {
    const store = R.useState(() => Z.create<FormData>(() => {
        return createFormData({
            name: '',
            location: '',
            department: departments[0],
            model: '',
            serialNumber: '',
            installDate: '',
            status: statuses[0],
        })
    }))[0]

    const { input, result } = store()
    const update = (newValues: Partial<Input>) => {
        store.setState(state => {
            return createFormData({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    const mkInputProps = (name: keyof Input) => {
        return {
            defaultValue: input[name],
            onChange: (
                it: R.ChangeEvent<HTMLInputElement> | R.ChangeEvent<HTMLSelectElement>
            ) => {
                update({ [name]: it.target.value })
            },
            errors: error?.[name]?._errors,
        }
    }

    return <div className='grow flex items-center'>
        <form className='flex flex-col p-4 mx-auto'>
            <div
                className={
                    'grid grid-cols-[auto] md:grid-cols-2 items-stretch gap-4'
                    + ' md:gap-x-8'
                }
            >
                <Input
                    title='Name'
                    type='text'
                    {...mkInputProps('name')}
                />
                <Input
                    title='Location'
                    type='text'
                    autoComplete='street-address'
                    {...mkInputProps('location')}
                />
                <Select
                    title='Department'
                    options={departments}
                    {...mkInputProps('department')}
                />
                <Input
                    title='Model'
                    type='text'
                    {...mkInputProps('model')}
                />
                <Input
                    title='Serial number'
                    type='text'
                    {...mkInputProps('serialNumber')}
                />
                <Input
                    title='Install date'
                    type='date'
                    {...mkInputProps('installDate')}
                />
                <Select
                    title='status'
                    options={statuses}
                    {...mkInputProps('status')}
                />
            </div>
            <div className='flex mt-6 md:mt-10 justify-end'>
                <div className='flex basis-sm shrink gap-3'>
                    <button
                        className={
                            'grow border border-indigo-400 cursor-pointer'
                            + ' px-1 py-2 rounded-xl box-border'
                        }
                        type='button'
                    >
                        Cancel
                    </button>
                    <button
                        className={
                            'grow border-indigo-600 bg-indigo-600 cursor-pointer'
                            + ' px-1 py-2 rounded-xl box-border text-white'
                        }
                        type='submit'
                    >
                        Submit
                    </button>
                </div>
            </div>
        </form>
    </div>
}
