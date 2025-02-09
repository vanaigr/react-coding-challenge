import * as R from 'react'
import * as Z from 'zustand'

import { equipmentFieldNames, statuses, departments } from '@/data/recordDefs'
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

    return <div className='grow flex items-center'>
        <form className='flex flex-col p-4 mx-auto' onSubmit={it => it.preventDefault()}>
            <div className='grid items-stretch gap-4 grid-cols-[auto] md:grid-cols-2 md:gap-x-8 lg:grid-cols-3'>
                <Input
                    type='text'
                    title={equipmentFieldNames.name}
                    defaultValue={input.name}
                    onChange={it => update({ name: it.target.value })}
                    errors={error?.name?._errors}
                />
                <Input
                    type='text'
                    autoComplete='street-address'
                    title={equipmentFieldNames.location}
                    defaultValue={input.location}
                    onChange={it => update({ location: it.target.value })}
                    errors={error?.location?._errors}
                />
                <Select
                    options={departments}
                    title={equipmentFieldNames.department}
                    defaultValue={input.department}
                    onChange={it => update({ department: it })}
                    errors={error?.department?._errors}
                />
                <Input
                    type='text'
                    title={equipmentFieldNames.model}
                    defaultValue={input.model}
                    onChange={it => update({ model: it.target.value })}
                    errors={error?.model?._errors}
                />
                <Input
                    type='text'
                    title={equipmentFieldNames.serialNumber}
                    defaultValue={input.serialNumber}
                    onChange={it => update({ serialNumber: it.target.value })}
                    errors={error?.serialNumber?._errors}
                />
                <Input
                    type='date'
                    title={equipmentFieldNames.installDate}
                    defaultValue={input.installDate}
                    onChange={it => update({ installDate: it.target.value })}
                    errors={error?.installDate?._errors}
                />
                <Select
                    options={statuses}
                    title={equipmentFieldNames.status}
                    defaultValue={input.status}
                    onChange={it => update({ status: it })}
                    errors={error?.status?._errors}
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
