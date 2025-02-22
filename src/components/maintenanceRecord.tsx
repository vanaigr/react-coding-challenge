import * as Z from 'zustand'

import { types, priorities, completionStatuses } from '@/data/maintenanceDefs'
import { type Raw, type FormState, createFormState } from '@/data/maintenanceForm'
import { Input, Select, EditableList } from '@/components/inputs'
import type { EquipmentInfo } from '@/util/equipmentInfo'
import FormButtons from '@/components/formButtons'


export type Props = {
    store: Z.StoreApi<FormState>,
    equipment: EquipmentInfo[],
    submit: { name: string, enabled: boolean },
    onSubmit: () => void,
}

export function FormDisplay({ store, equipment, submit, onSubmit }: Props) {
    const ids = ['']
    const names = ['Select equipment']
    const titles = ['Select equipment']
    for(let i = 0; i < equipment.length; i++) {
        const it = equipment[i]

        ids.push(it.id)
        names.push('' + it.id + ' ("' + it.name + '")')
        titles.push(it.desc)
    }

    const { input, result } = Z.useStore(store)
    const update = (newValues: Partial<Raw>) => {
        store.setState(state => {
            return createFormState({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    return <form
        className='grow flex flex-col p-4'
        action={() => { onSubmit() }}
    >
        <div className='grow flex flex-col'>
            <div
                className={
                    'grid items-stretch gap-6 grid-cols-[auto]'
                        + ' md:grid-cols-2 md:gap-x-10 mx-auto'
                }
            >
                <Select
                    title='Equipment'
                    options={ids}
                    optionNames={names}
                    optionTitles={titles}
                    defaultValue={input.equipmentId}
                    onChange={it => update({ equipmentId: it })}
                    errors={error?.equipmentId?._errors}
                    id_prefix='form_equipmentId'
                />
                <Input
                    title='Date'
                    type='date'
                    defaultValue={input.date}
                    onChange={it => update({ date: it.target.value })}
                    errors={error?.date?._errors}
                    id_prefix='form_date'
                />
                <Select
                    title='Type'
                    options={types}
                    defaultValue={input.type}
                    onChange={it => update({ type: it })}
                    errors={error?.type?._errors}
                    id_prefix='form_type'
                />
                <Input
                    title='Technician'
                    type='text'
                    defaultValue={input.technician}
                    onChange={it => update({ technician: it.target.value })}
                    errors={error?.technician?._errors}
                    id_prefix='form_technician'
                />
                <Input
                    title='Hours spent'
                    type='number'
                    defaultValue={input.hoursSpent}
                    onChange={it => update({ hoursSpent: it.target.value })}
                    errors={error?.hoursSpent?._errors}
                    id_prefix='form_hoursSpent'
                />
                <Input
                    title='Description'
                    type='text'
                    defaultValue={input.description}
                    onChange={it => update({ description: it.target.value })}
                    errors={error?.description?._errors}
                    id_prefix='form_description'
                />
                <Select
                    title='Priority'
                    options={priorities}
                    defaultValue={input.priority}
                    onChange={it => update({ priority: it })}
                    errors={error?.priority?._errors}
                    id_prefix='form_priority'
                />
                <Select
                    title='Completion status'
                    options={completionStatuses}
                    defaultValue={input.completionStatus}
                    onChange={it => update({ completionStatus: it })}
                    errors={error?.completionStatus?._errors}
                    id_prefix='form_completionStatus'
                />
                <EditableList
                    title='Parts replaced'
                    defaultValue={input.partsReplaced}
                    onChange={list => update({ partsReplaced: list })}
                    errors={error?.partsReplaced?._errors}
                    id_prefix='form_partsReplaced'
                />
            </div>
        </div>
        <FormButtons submitName={submit.name} canSubmit={submit.enabled}/>
    </form>
}

