'use client'
import { useRouter, useParams } from 'next/navigation'
import * as R from 'react'
import * as Z from 'zustand'

import type { Equipment } from '@/data/recordDefs'
import { createFormState } from '@/data/equipmentForm'
import { FormDisplay } from '@/components/equipmentRecord'
import { toISODate } from '@/util/date'
import { updateEquipment } from './action'

export type FormProps = {
    id: string,
    initial: Equipment
}

export function Form({ id, initial }: FormProps) {
    const navigate = useRouter()
    const [submitting, setSubmitting] = R.useState(false)
    const store = R.useState(() => {
        return Z.createStore(() => {
            return createFormState({
                name: initial.name,
                location: initial.location,
                department: initial.department,
                model: initial.model,
                serialNumber: initial.serialNumber,
                installDate: toISODate(initial.installDate),
                status: initial.status,
            })
        })
    })[0]
    const valid = Z.useStore(store, it => it.result.success)
    const canSubmit = valid && !submitting

    return <FormDisplay
        store={store}
        submit={{ name: 'Update', enabled: canSubmit }}
        onSubmit={async() => {
            if(!canSubmit) return

            setSubmitting(true)
            try {
                const res = await updateEquipment(id, store.getState().result.data!)
                if(res.ok) {
                    navigate.back()
                    // cannot re-submit
                }
            }
            catch(err) {
                setSubmitting(false)
                console.error(err)
            }
        }}
    />
}
