import Header from '@/components/header'
import { Form } from './form'

export default async function() {
    return <div className='grow flex flex-col min-w-fit'>
        <Header path={[{ url: '/equipment', name: 'Equipment records' }]} name='new'/>
        <Form/>
    </div>
}
