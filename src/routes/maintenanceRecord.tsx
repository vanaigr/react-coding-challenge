import * as R from 'react'
import * as Z from 'zustand'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type Raw, type FormData, createFormData } from '@/data/maintenanceForm'
import { Input, Select, EditableList } from '@/components/inputs'
import { store as equpmentStore } from '@/data/equipment'

export default function Component() {
    const store = R.useState(() => Z.create<FormData>(() => {
        return createFormData({
            equipmentId: '',
            date: '',
            type: types[0],
            technician: '',
            hoursSpent: 1,
            description: '',
            partsReplaced: [],
            priority: priorities[0],
            completionStatus: completionStatuses[0],
        })
    }))[0]

    const equipment = Z.useStore(equpmentStore)
    const ids = []
    const names = []
    const titles = []
    for(let i = 0; i < equipment.length; i++) {
        const it = equipment[i]
        ids.push(it.id)
        names.push('' + it.id + ' ("' + it.name + '")')
        titles.push(
            '"' + it.name + '" in ' + it.location
                + '\nDepartment: ' + it.department
                + '\nSerial: ' + it.serialNumber
                + '\nStatus: ' + it.status
        )
    }

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
        <form className='flex flex-col p-4 mx-auto' onSubmit={ev => ev.preventDefault()}>
            <div
                className={
                    'grid grid-cols-[auto] md:grid-cols-2 items-stretch gap-4'
                    + ' md:gap-x-8'
                }
            >
                <Select
                    title='Equipment'
                    options={ids}
                    optionNames={names}
                    optionTitles={titles}
                    {...mkInputProps('equipmentId')}
                />
                <Input
                    title='Date'
                    type='date'
                    {...mkInputProps('date')}
                />
                <Select
                    title='Type'
                    options={types}
                    {...mkInputProps('type')}
                />
                <Input
                    title='technician'
                    type='text'
                    {...mkInputProps('technician')}
                />
                <Input
                    title='Hours spent'
                    type='number'
                    {...mkInputProps('hoursSpent')}
                />
                <Input
                    title='Description'
                    type='text'
                    {...mkInputProps('description')}
                />
                <Select
                    title='Priority'
                    options={priorities}
                    {...mkInputProps('priority')}
                />
                <Select
                    title='Completion status'
                    options={completionStatuses}
                    {...mkInputProps('completionStatus')}
                />
                <EditableList
                    title='Parts Replaced'
                    defaultValue={input.partsReplaced}
                    onChange={list => update({ partsReplaced: list })}
                    errors={error?.partsReplaced?._errors}
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

