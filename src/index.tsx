import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
    { path: '/', element: <div>dashboard</div> },
    { path: '/equipment', element: <div>equipment table</div> },
    { path: '/equipment/:id', element: <div>equipment record</div> },
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
