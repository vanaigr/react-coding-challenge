import * as R from 'react'
import * as Z from 'zustand'

import { statuses, departments } from '@/data/records'
import { type Raw, type FormData, createFormData } from '@/data/equipmentForm'
import { Input, Select } from '@/components/inputs'

export default function Component() {
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
    const update = (newValues: Partial<Raw>) => {
        store.setState(state => {
            return createFormData({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    const mkInputProps = (name: keyof Raw) => {
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
