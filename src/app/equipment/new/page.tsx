import Header from '@/components/header'
import { Form } from './form'

export default async function() {
    return <div className='grow flex flex-col'>
        <Header path={[{ url: '/equipment/new', name: 'Equipment records' }]} name='new'/>
        <Form/>
    </div>
}
