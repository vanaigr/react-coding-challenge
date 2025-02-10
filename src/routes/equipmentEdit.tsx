import * as R from 'react'
import * as RD from 'react-router-dom'
import * as Z from 'zustand'

import { type FormData, createFormData } from '@/data/equipmentForm'
import Page from '@/components/equipmentRecord'
import { store as eStore } from '@/data/equipment'
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

            const newEquipment = new Map(eStore.getState())

            newEquipment.set(id, { ...state.result.data, id })
            eStore.setState(newEquipment, true)

            navigate(-1)
            return true
        }}
    />
}
