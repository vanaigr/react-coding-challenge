import * as R from 'react'
import * as Z from 'zustand'
import * as RD from 'react-router-dom'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type Raw, type FormData, createFormData } from '@/data/maintenanceForm'
import { Input, Select, EditableList } from '@/components/inputs'
import { store as equpmentStore } from '@/data/equipment'
import Header from '@/components/header'

export type Props = {
    store: Z.StoreApi<FormData>,
    name: string,
    submitName: string,
    onSubmit: () => boolean,
}

export default function Component({ store, name, submitName, onSubmit }: Props) {
    const navigate = RD.useNavigate()
    const [submitted, setSubmitted] = R.useState(false)

    const equipment = Z.useStore(equpmentStore)
    const ids = ['']
    const names = ['Select equipment']
    const titles = ['Select equipment']
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

    const { input, result } = Z.useStore(store)
    const update = (newValues: Partial<Raw>) => {
        store.setState(state => {
            return createFormData({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    const canSubmit = result.success && !submitted
    const submitC = 'grow px-1 py-2 rounded-xl box-border text-white'
        + (canSubmit
                ? ' cursor-pointer border-indigo-600 bg-indigo-600'
                : ' border-indigo-300 bg-indigo-300')

    return <div className='grow flex flex-col items-stretch'>
        <Header path={[{ url: '/maintenance', name: 'Maintenance records' }]} name={name}/>
        <form
            className='flex flex-col p-4 mx-auto'
            onSubmit={it => {
                it.preventDefault()
                if(!submitted) {
                    setSubmitted(onSubmit())
                }
            }}
        >
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
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        className={submitC}
                        disabled={!canSubmit}
                        type='submit'
                    >
                        {submitName}
                    </button>
                </div>
            </div>
        </form>
    </div>
}

