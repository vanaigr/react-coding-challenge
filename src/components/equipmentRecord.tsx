import * as R from 'react'
import * as Z from 'zustand'

import { equipmentFieldNames, statuses, departments } from '@/data/recordDefs'
import { type Raw, type FormData, createFormData } from '@/data/equipmentForm'
import { Input, Select } from '@/components/inputs'
import Header from '@/components/header'
import FormButtons from '@/components/formButtons'

export type Props = {
    store: Z.StoreApi<FormData>,
    name: string,
    submitName: string,
    onSubmit: () => boolean,
}

export default function Component({ store, name, submitName, onSubmit }: Props) {
    const [submitted, setSubmitted] = R.useState(false)

    const { input, result } = Z.useStore(store)
    const update = (newValues: Partial<Raw>) => {
        store.setState(state => {
            return createFormData({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    const canSubmit = result.success && !submitted

    return <div className='grow flex flex-col'>
        <Header path={[{ url: '/equipment', name: 'Equipment records' }]} name={name}/>
        <form
            className='grow flex flex-col p-4'
            onSubmit={it => {
                it.preventDefault()
                if(!submitted) {
                    setSubmitted(onSubmit())
                }
            }}
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
            </div>
            <FormButtons submitName={submitName} canSubmit={canSubmit}/>
        </form>
    </div>
}
