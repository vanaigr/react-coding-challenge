'use client'
import * as R from 'react'
import * as Z from 'zustand'
import { useRouter } from 'next/navigation'
import { v4 as V4 } from 'uuid'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type FormData, createFormData } from '@/data/maintenanceForm'
import { store as mStore } from '@/data/maintenance'
import Page from '@/components/maintenanceRecord'

export default function Component() {
    const navigate = useRouter()
    const store = R.useState(() => Z.createStore<FormData>(() => {
        return createFormData({
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

    return <Page
        store={store}
        name='new'
        submitName='Add'
        onSubmit={() => {
            const state = store.getState()
            if(!state.result.success) return false

            const newMaintenance = new Map(mStore.getState())

            let uuid = V4()
            while(newMaintenance.has(uuid)) uuid = V4()

            newMaintenance.set(uuid, {
                ...state.result.data,
                id: uuid,
            })

            mStore.setState(newMaintenance, true)

            navigate.back()
            return true
        }}
    />
}
