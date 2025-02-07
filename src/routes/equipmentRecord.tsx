import * as R from 'react'
import { z } from 'zod'

type InputProps = {
    title: string,
} & R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

const inputContC = 'flex flex-col items-stretch'
const inputC = 'border border-indigo-400 rounded-md'
    + ' focus:outline-indigo-400 w-xs h-xs text-lg h-12'

function Input({ title, ...rest }: InputProps) {
    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <input className={inputC + ' px-4'} {...rest}/>
    </label>
}

type SelectProps = {
    title: string,
    options: string[],
} & R.DetailedHTMLProps<R.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

function Select({ title, options, ...rest }: SelectProps) {
    return <label className={inputContC}>
        <span className='font-sans mb-1'>{title}</span>
        <select className={inputC + ' px-3'} {...rest}>
            {options.map((v, i) => (
                <option value={i}>{v}</option>
            ))}
        </select>
    </label>
}

const departments = ['Machining', 'Assembly', 'Packaging', 'Shipping']
const statuses = ['Operational', 'Down', 'Maintenance', 'Retired']

export default function() {
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
                    defaultValue={'1'}
                />
                <Input
                    title='Location'
                    type='text'
                    autoComplete='street-address'
                    defaultValue={'1'}
                />
                <Select
                    title='Department'
                    options={departments}
                />
                <Input
                    title='Model'
                    type='text'
                    defaultValue={'1'}
                />
                <Input
                    title='Serial number'
                    type='text'
                    defaultValue={'1'}
                />
                <Input
                    title='Install date'
                    type='date'
                    defaultValue={'1'}
                />
                <Select
                    title='status'
                    options={statuses}
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
