import * as R from 'react'
import * as Z from 'zustand'

import { types, priorities, completionStatuses } from '@/data/recordDefs'
import { type Raw, type FormData, createFormData } from '@/data/maintenanceForm'
import Page from '@/components/maintenanceRecord'

export default function Component() {
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

    return <Page store={store} name='new'/>
}
