import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import EquipmentRecord from './routes/equipmentRecord'

const router = createBrowserRouter([
    { path: '/', element: <div>dashboard</div> },
    { path: '/equipment', element: <div>equipment table</div> },
    { path: '/equipment/:id', element: <EquipmentRecord/> },
    { path: '/maintenance', element: <div>maintenance table</div> },
    { path: '/maintenance/:id', element: <div>maintenance record</div> },
    { path: '*', element: <div>404</div> },
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
)
