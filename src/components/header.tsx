import * as R from 'react'
import Link from 'next/link'

export type PathEntry = { name: string, url: string }
export type HeaderProps = { path?: Array<PathEntry>, name?: string }

const pathC = ' whitespace-nowrap overflow-hidden text-ellipsis'

export default function Header({ path, name }: HeaderProps) {
    const root = (path == null || path.length === 0) && name == null

    const pathComponents: Array<R.ReactElement> = []
    if(root) {
        pathComponents.push(
            <span key='home-d' className={'material-symbols-outlined' + pathC}>home</span>
        )
    }
    else {
        pathComponents.push(
            <Link key='home' href={'/'} className={'material-symbols-outlined' + pathC}>
                home
            </Link>
        )

        if(path != null) {
            for(let i = 0; i < path.length; i++) {
                const it = path[i]
                pathComponents.push(
                    <span key={i + '-d'} className='text-gray-600 material-symbols-outlined'>
                        {'chevron_right'}
                    </span>
                )
                pathComponents.push(
                    <Link key={i} className={pathC} href={it.url}>{it.name}</Link>
                )
            }
        }

        if(name != null) {
            pathComponents.push(
                <span key='name-d' className='text-gray-600 material-symbols-outlined'>
                    {'chevron_right'}
                </span>
            )
            pathComponents.push(
                <span key='name' className={pathC}>{name}</span>
            )
        }
    }

    return <div className='flex justify-center mb-4 bg-white border-b border-indigo-200 min-w-fit'>
        <div className='max-w-7xl grow py-7 px-4 flex gap-6 items-center min-w-fit'>
            <div className='flex gap-2 grow max-w-[50%] sm:max-w-[100%]'>
                {pathComponents}
            </div>
            <div className='flex items-center gap-6 text-sm text-slate-900'>
                <Link href='/equipment'>Equipment</Link>
                <Link href='/equipment/new'>Add equipment record</Link>
                <Link href='/maintenance'>Maintenance</Link>
                <Link href='/maintenance/new'>Add maintenance record</Link>
            </div>
        </div>
    </div>
}
