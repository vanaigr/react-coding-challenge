import * as R from 'react'
import * as RD from 'react-router-dom'
import * as Z from 'zustand'

import { type FormData, createFormData } from '@/data/maintenanceForm'
import Page from '@/components/maintenanceRecord'
import { store as mStore } from '@/data/maintenance'
import { toISODate } from '@/util/date'

export default function Component() {
    const { id } = RD.useParams()
    if(id == null) return <RD.Navigate to='/404'/>

    return <Inner id={id}/>
}

function Inner({ id }: { id: string }) {
    const navigate = RD.useNavigate()
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
    if(store === 'error') return <RD.Navigate to='/404'/>

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

            navigate(-1)
            return true
        }}
    />
}
