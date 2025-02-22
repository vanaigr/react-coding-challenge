'use client'
import * as R from 'react'
import * as Z from 'zustand'
import { useRouter } from 'next/navigation'

import { statuses, departments } from '@/data/equipmentDefs'
import { type FormState, createFormState } from '@/data/equipmentForm'
import { FormDisplay } from '@/components/equipmentRecord'
import { addEquipment } from './action'

export function Form() {
    const navigate = useRouter()
    const [submitting, setSubmitting] = R.useState(false)
    const store = R.useState(() => Z.create<FormState>(() => {
        return createFormState({
            name: '',
            location: '',
            department: departments[0],
            model: '',
            serialNumber: '',
            installDate: '',
            status: statuses[0],
        })
    }))[0]
    const valid = Z.useStore(store, it => it.result.success)
    const canSubmit = valid && !submitting

    return <FormDisplay
        store={store}
        submit={{ name: 'Add', enabled: canSubmit }}
        onSubmit={async() => {
            if(!canSubmit) return

            setSubmitting(true)
            try {
                const res = await addEquipment(store.getState().result.data!)
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
