'use client'
import * as R from 'react'
import * as Z from 'zustand'
import { useRouter } from 'next/navigation'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type FormState, createFormState } from '@/data/maintenanceForm'
import { FormDisplay } from '@/components/maintenanceRecord'
import { type EquipmentInfo } from '@/util/equipmentInfo'
import { addMaintenanceRecord } from './action'

export { EquipmentInfo }
export type FormProps = {
    equipment: EquipmentInfo[]
}

export function Form({ equipment }: FormProps) {
    const navigate = useRouter()

    const [submitting, setSubmitting] = R.useState(false)
    const store = R.useState(() => Z.createStore<FormState>(() => {
        return createFormState({
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
    const valid = Z.useStore(store, it => it.result.success)

    const canSubmit = valid && !submitting

    return <FormDisplay
        equipment={equipment}
        store={store}
        submit={{ name: 'Add', enabled: canSubmit }}
        onSubmit={async() => {
            if(!canSubmit) return

            setSubmitting(true)
            try {
                const res = await addMaintenanceRecord(store.getState().input)
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
