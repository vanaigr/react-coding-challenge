'use client'
import * as R from 'react'
import { useRouter, useParams } from 'next/navigation'
import * as Z from 'zustand'

import { type FormData, createFormData } from '@/data/maintenanceForm'
import Page from '@/components/maintenanceRecord'
import { store as mStore } from '@/data/maintenance'
import { toISODate } from '@/util/date'

export default function Component() {
    const navigate = useRouter()
    const { id }: { id: string } = useParams()
    const [store, setStore] = R.useState<Z.StoreApi<FormData> | null | 'error'>(null)

    R.useEffect(() => {
        const records = mStore.getState()
        const record = records.get(id)
        if(record == null) {
            setStore('error')
            return
        }

        const newStore = Z.createStore<FormData>(() => {
            return createFormData({
                equipmentId: record.equipmentId,
                date: toISODate(record.date),
                type: record.type,
                technician: record.technician,
                hoursSpent: '' + record.hoursSpent,
                description: record.description,
                partsReplaced: record.partsReplaced,
                priority: record.priority,
                completionStatus: record.completionStatus,
            })
        })
        setStore(newStore)
    }, [id])

    // TODO: error message?
    R.useEffect(() => {
        // TODO: error message?
        if(store === 'error') navigate.replace('/404')
    }, [store])

    if(store == null || store === 'error') return

    if(store == null) return

    return <Page
        store={store}
        name={id}
        submitName='Update'
        onSubmit={() => {
            const state = store.getState()
            if(!state.result.success) return false

            const newMaintenance = new Map(mStore.getState())

            newMaintenance.set(id, { ...state.result.data, id })
            mStore.setState(newMaintenance, true)

            navigate.back()
            return true
        }}
    />
}
