import * as R from 'react'
import * as RN from 'react-router-dom'

export type PathEntry = { name: String, url: string }
export type HeaderProps = { path: Array<PathEntry>, name: string }

export default function Header({ path, name }: HeaderProps) {
    const pathComponents: Array<R.ReactElement> = []
    pathComponents.push(<RN.Link to={'/'} className='material-symbols-outlined'>home</RN.Link>)
    for(let i = 0; i < path.length; i++) {
        const it = path[i]
        pathComponents.push(<span className='text-gray-600 material-symbols-outlined'>{'chevron_right'}</span>)
        pathComponents.push(<RN.Link to={it.url}>{it.name}</RN.Link>)
    }
    pathComponents.push(<span className='text-gray-600 material-symbols-outlined'>{'chevron_right'}</span>)
    pathComponents.push(<span>{name}</span>)

    return <div className='flex justify-center mb-4'>
        <div className='max-w-6xl grow border-b border-indigo-200 py-7 px-4 flex gap-6 items-center'>
            <div className='flex gap-2 grow'>
                {pathComponents}
            </div>
            <div className='flex gap-8 text-sm text-slate-900'>
                <RN.Link to='/equipment'>Equipment</RN.Link>
                <RN.Link to='/equipment/new'>Add equipment record</RN.Link>
                <RN.Link to='/maintenance'>Maintenance</RN.Link>
                <RN.Link to='/maintenance/new'>Add maintenance record</RN.Link>
            </div>
        </div>
    </div>
}
