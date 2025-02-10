import * as R from 'react'
import * as Z from 'zustand'

import { statuses, departments } from '@/data/recordDefs'
import { type FormData, createFormData } from '@/data/equipmentForm'
import Page from '@/components/equipmentRecord'

export default function Component() {
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

    return <Page store={store} name='new'/>
}
