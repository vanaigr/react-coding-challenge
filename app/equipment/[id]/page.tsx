'use client'
import { useRouter, useParams } from 'next/navigation'
import * as R from 'react'
import * as Z from 'zustand'

import { type FormData, createFormData } from '@/data/equipmentForm'
import Page from '@/components/equipmentRecord'
import { store as eStore } from '@/data/equipment'
import { toISODate } from '@/util/date'

export default function Component() {
    const navigate = useRouter()
    const { id }: { id: string } = useParams()
    const [store, setStore] = R.useState<Z.StoreApi<FormData> | null | 'error'>(null)

    R.useEffect(() => {
        const records = eStore.getState()
        const record = records.get(id)
        if(record == null) {
            setStore('error')
            return
        }

        const newStore = Z.createStore<FormData>(() => {
            return createFormData({
                name: record.name,
                location: record.location,
                department: record.department,
                model: record.model,
                serialNumber: record.serialNumber,
                installDate: toISODate(record.installDate),
                status: record.status,
            })
        })
        setStore(newStore)
    }, [id])

    R.useEffect(() => {
        // TODO: error message?
        if(store === 'error') navigate.replace('/404')
    }, [store])

    if(store == null || store === 'error') return

    return <Page
        store={store}
        name={id}
        submitName='Update'
        onSubmit={() => {
            const state = store.getState()
            if(!state.result.success) return false

            const newEquipment = new Map(eStore.getState())

            newEquipment.set(id, { ...state.result.data, id })
            eStore.setState(newEquipment, true)

            navigate.back()
            return true
        }}
    />
}
