import * as R from 'react'
import * as Z from 'zustand'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type Raw, type FormData, createFormData } from '@/data/maintenanceForm'
import { Input, Select, EditableList } from '@/components/inputs'
import { store as equpmentStore } from '@/data/equipment'
import Header from '@/components/header'

export default function Component() {
    const store = R.useState(() => Z.create<FormData>(() => {
        return createFormData({
            equipmentId: '',
            date: '',
            type: types[0],
            technician: '',
            hoursSpent: '1',
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
    for(const it of equipment.values()) {
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

    return <div className='grow flex flex-col items-stretch'>
        <Header path={[{ url: '/maintenance', name: 'Maintenance records' }]} name='new'/>
        <form className='flex flex-col p-4 mx-auto' onSubmit={ev => ev.preventDefault()}>
            <div className='grid items-stretch gap-6 grid-cols-[auto] md:grid-cols-2 md:gap-x-10'>
                <Select
                    title='Equipment'
                    options={ids}
                    optionNames={names}
                    optionTitles={titles}
                    defaultValue={input.equipmentId}
                    onChange={it => update({ equipmentId: it })}
                    errors={error?.equipmentId?._errors}
                />
                <Input
                    title='Date'
                    type='date'
                    defaultValue={input.date}
                    onChange={it => update({ date: it.target.value })}
                    errors={error?.date?._errors}
                />
                <Select
                    title='Type'
                    options={types}
                    defaultValue={input.type}
                    onChange={it => update({ type: it })}
                    errors={error?.type?._errors}
                />
                <Input
                    title='Technician'
                    type='text'
                    defaultValue={input.technician}
                    onChange={it => update({ technician: it.target.value })}
                    errors={error?.technician?._errors}
                />
                <Input
                    title='Hours spent'
                    type='number'
                    defaultValue={input.hoursSpent}
                    onChange={it => update({ hoursSpent: it.target.value })}
                    errors={error?.hoursSpent?._errors}
                />
                <Input
                    title='Description'
                    type='text'
                    defaultValue={input.description}
                    onChange={it => update({ description: it.target.value })}
                    errors={error?.description?._errors}
                />
                <Select
                    title='Priority'
                    options={priorities}
                    defaultValue={input.priority}
                    onChange={it => update({ priority: it })}
                    errors={error?.priority?._errors}
                />
                <Select
                    title='Completion status'
                    options={completionStatuses}
                    defaultValue={input.completionStatus}
                    onChange={it => update({ completionStatus: it })}
                    errors={error?.completionStatus?._errors}
                />
                <EditableList
                    title='Parts replaced'
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

