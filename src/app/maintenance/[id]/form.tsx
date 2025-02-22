'use client'
import * as R from 'react'
import { useRouter } from 'next/navigation'
import * as Z from 'zustand'

import { type Validated, type FormState, createFormState } from '@/data/maintenanceForm'
import { toISODate } from '@/util/date'
import { FormDisplay } from '@/components/maintenanceRecord'
import { updateMaintenanceRecord } from './action'
import type { EquipmentInfo } from '@/util/equipmentInfo'

export type FormProps = {
    id: string
    initial: Validated
    equipment: EquipmentInfo[]
}
export function Form({ id, initial, equipment }: FormProps) {
    const navigate = useRouter()
    const [submitting, setSubmitting] = R.useState(false)

    const store = R.useState<Z.StoreApi<FormState>>(() => {
        return Z.createStore(() => createFormState({
            equipmentId: initial.equipmentId,
            date: toISODate(initial.date),
            type: initial.type,
            technician: initial.technician,
            hoursSpent: '' + initial.hoursSpent,
            description: initial.description,
            partsReplaced: initial.partsReplaced,
            priority: initial.priority,
            completionStatus: initial.completionStatus,
        }))
    })[0]
    const valid = Z.useStore(store, it => it.result.success)

    const canSubmit = valid && !submitting

    return <FormDisplay
        store={store}
        equipment={equipment}
        submit={{ name: 'Update', enabled: canSubmit }}
        onSubmit={async() => {
            if(!canSubmit) return

            setSubmitting(true)
            try {
                const res = await updateMaintenanceRecord(id, store.getState().result.data!)
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
