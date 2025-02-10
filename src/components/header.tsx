import * as R from 'react'
import * as RN from 'react-router-dom'

export type PathEntry = { name: string, url: string }
export type HeaderProps = { path?: Array<PathEntry>, name?: string }

const pathC = ' whitespace-nowrap overflow-hidden text-ellipsis'

export default function Header({ path, name }: HeaderProps) {
    const root = (path == null || path.length === 0) && name == null

    const pathComponents: Array<R.ReactElement> = []
    if(root) {
        pathComponents.push(<span className={'material-symbols-outlined' + pathC}>home</span>)
    }
    else {
        pathComponents.push(<RN.Link to={'/'} className={'material-symbols-outlined' + pathC}>home</RN.Link>)

        if(path != null) {
            for(let i = 0; i < path.length; i++) {
                const it = path[i]
                pathComponents.push(<span className='text-gray-600 material-symbols-outlined'>{'chevron_right'}</span>)
                pathComponents.push(<RN.Link className={pathC} to={it.url}>{it.name}</RN.Link>)
            }
        }

        if(name != null) {
            pathComponents.push(<span className='text-gray-600 material-symbols-outlined'>{'chevron_right'}</span>)
            pathComponents.push(<span className={pathC}>{name}</span>)
        }
    }

    return <div className='flex justify-center mb-4'>
        <div className='max-w-7xl grow border-b border-indigo-200 py-7 px-4 flex gap-6 items-center'>
            <div className='flex gap-2 grow max-w-[50%]'>
                {pathComponents}
            </div>
            <div className='flex gap-6 text-sm text-slate-900'>
                <RN.Link to='/equipment'>Equipment</RN.Link>
                <RN.Link to='/equipment/new'>Add equipment record</RN.Link>
                <RN.Link to='/maintenance'>Maintenance</RN.Link>
                <RN.Link to='/maintenance/new'>Add maintenance record</RN.Link>
            </div>
        </div>
    </div>
}
