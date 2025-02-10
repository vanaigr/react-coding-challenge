import * as R from 'react'
import * as Z from 'zustand'
import * as RD from 'react-router-dom'
import { v4 as V4 } from 'uuid'

import { statuses, departments } from '@/data/recordDefs'
import { type FormData, createFormData } from '@/data/equipmentForm'
import { store as equipmentStore } from '@/data/equipment'
import Page from '@/components/equipmentRecord'

export default function Component() {
    const navigate = RD.useNavigate()
    const store = R.useState(() => Z.create<FormData>(() => {
        return createFormData({
            name: '',
            location: '',
            department: departments[0],
            model: '',
            serialNumber: '',
            installDate: '',
            status: statuses[0],
        })
    }))[0]

    return <Page
        store={store}
        name='new'
        submitName='Add'
        onSubmit={() => {
            const state = store.getState()
            if(!state.result.success) return false

            const newEquipment = new Map(equipmentStore.getState())

            let uuid = V4()
            while(newEquipment.has(uuid)) uuid = V4()

            newEquipment.set(uuid, {
                ...state.result.data,
                id: uuid,
            })

            equipmentStore.setState(newEquipment, true)

            navigate(-1)
            return true
        }}
    />
}
