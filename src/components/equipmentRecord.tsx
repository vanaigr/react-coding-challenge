import * as R from 'react'
import * as Z from 'zustand'

import { fieldNames, statuses, departments } from '@/data/equipmentDefs'
import { type Raw, type FormState, createFormState } from '@/data/equipmentForm'
import { Input, Select } from '@/components/inputs'
import FormButtons from '@/components/formButtons'

export type Props = {
    store: Z.StoreApi<FormState>,
    submit: { name: string, enabled: boolean },
    onSubmit: () => void,
}

export function FormDisplay({ store, submit, onSubmit }: Props) {
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
                <Input
                    type='text'
                    title={fieldNames.name}
                    defaultValue={input.name}
                    onChange={it => update({ name: it.target.value })}
                    errors={error?.name?._errors}
                    id_prefix='form_name'
                />
                <Input
                    type='text'
                    autoComplete='street-address'
                    title={fieldNames.location}
                    defaultValue={input.location}
                    onChange={it => update({ location: it.target.value })}
                    errors={error?.location?._errors}
                    id_prefix='form_location'
                />
                <Select
                    options={departments}
                    title={fieldNames.department}
                    defaultValue={input.department}
                    onChange={it => update({ department: it })}
                    errors={error?.department?._errors}
                    id_prefix='form_department'
                />
                <Input
                    type='text'
                    title={fieldNames.model}
                    defaultValue={input.model}
                    onChange={it => update({ model: it.target.value })}
                    errors={error?.model?._errors}
                    id_prefix='form_model'
                />
                <Input
                    type='text'
                    title={fieldNames.serialNumber}
                    defaultValue={input.serialNumber}
                    onChange={it => update({ serialNumber: it.target.value })}
                    errors={error?.serialNumber?._errors}
                    id_prefix='form_serialNumber'
                />
                <Input
                    type='date'
                    title={fieldNames.installDate}
                    defaultValue={input.installDate}
                    onChange={it => update({ installDate: it.target.value })}
                    errors={error?.installDate?._errors}
                    id_prefix='form_installDate'
                />
                <Select
                    options={statuses}
                    title={fieldNames.status}
                    defaultValue={input.status}
                    onChange={it => update({ status: it })}
                    errors={error?.status?._errors}
                    id_prefix='form_status'
                />
            </div>
        </div>
        <FormButtons submitName={submit.name} canSubmit={submit.enabled}/>
    </form>
}
