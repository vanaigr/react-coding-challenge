import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import EquipmentRecord from '@/routes/equipmentRecord'
import EquipmentTable from '@/routes/equipmentTable'
import MaintenanceRecord from '@/routes/maintenanceRecord'

const router = createBrowserRouter([
    { path: '/', element: <div>dashboard</div> },
    { path: '/equipment', element: <EquipmentTable/> },
    { path: '/equipment/:id', element: <EquipmentRecord/> },
    { path: '/maintenance', element: <div>maintenance table</div> },
    { path: '/maintenance/:id', element: <MaintenanceRecord/> },
    { path: '*', element: <div>404</div> },
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
)
