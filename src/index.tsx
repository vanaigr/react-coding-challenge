import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

// import EquipmentRecord from '@/routes/equipmentRecord'
import EquipmentTable from '@/routes/equipmentTable'
import EquipmentNew from '@/routes/equipmentNew'
import EquipmentEdit from '@/routes/equipmentEdit'

import MaintenanceTable from '@/routes/maintenanceTable'
import MaintenanceNew from '@/routes/maintenanceNew'
import MaintenanceEdit from '@/routes/maintenanceEdit'

import Dashboard from '@/routes/dashboard'

const router = createBrowserRouter([
    { path: '/', element: <Dashboard/> },

    { path: '/equipment', element: <EquipmentTable/> },
    { path: '/equipment/new', element: <EquipmentNew/> },
    { path: '/equipment/:id', element: <EquipmentEdit/> },

    { path: '/maintenance', element: <MaintenanceTable/> },
    { path: '/maintenance/new', element: <MaintenanceNew/> },
    { path: '/maintenance/:id', element: <MaintenanceEdit/> },

    { path: '*', element: <div>404</div> },
])

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
)
