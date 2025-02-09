import * as R from 'react'
import * as Z from 'zustand'
import { z } from 'zod'

import {
    cmp as dateCmp,
    dateValidation,
    dateLocalToComponents,
} from '@/util/date'
import { statuses, departments } from '@/data/records'

const validation = z.object({
    name: z.string().min(3, 'Must be at least 3 characters long'),
    location: z.string().nonempty('Must not be empty'),
    department: z.string().pipe(z.enum(departments)),
    model: z.string().nonempty('Must not be empty'),
    serialNumber: z.string().regex(/^[\p{L}\p{N}]+$/u, 'Must be alphanumeric'),
    installDate: z.string().pipe(dateValidation).refine(it => {
        const today = dateLocalToComponents(new Date())!
        // TODO: is "past date" exclusive?
        return dateCmp(it, today) <= 0
    }, 'Must be past date'),
    status: z.string().pipe(z.enum(statuses)),
})

type RawEquipmentData = z.input<typeof validation>
type ValidatedEquipmentData = z.infer<typeof validation>

export type FormData = {
    input: RawEquipmentData,
    result: z.SafeParseReturnType<RawEquipmentData, ValidatedEquipmentData>,
}

export function createFormData(input: RawEquipmentData): FormData {
    const result = validation.safeParse(input)
    return { input, result }
}

export default function Component() {
    const store = R.useState(() => Z.create<FormData>(() => {
        return createFormData({
            name: '',
            location: '',
            department: departments[0],
            model: '',
            serialNumber: '',
            installDate: '',
            status: statuses[0],
        })
    }))[0]

    const { input, result } = store()
    const update = (newValues: Partial<RawEquipmentData>) => {
        store.setState(state => {
            return createFormData({ ...state.input, ...newValues })
        }, true)
    }
    const error = result.error?.format()

    const mkInputProps = (name: keyof RawEquipmentData) => {
        return {
            defaultValue: input[name],
            onChange: (
                it: R.ChangeEvent<HTMLInputElement> | R.ChangeEvent<HTMLSelectElement>
            ) => {
                update({ [name]: it.target.value })
            },
            errors: error?.[name]?._errors,
        }
    }

    return <div className='grow flex items-center'>
        <form className='flex flex-col p-4 mx-auto'>
            <div
                className={
                    'grid grid-cols-[auto] md:grid-cols-2 items-stretch gap-4'
                    + ' md:gap-x-8'
                }
            >
                <Input
                    title='Name'
                    type='text'
                    {...mkInputProps('name')}
                />
                <Input
                    title='Location'
                    type='text'
                    autoComplete='street-address'
                    {...mkInputProps('location')}
                />
                <Select
                    title='Department'
                    options={departments}
                    {...mkInputProps('department')}
                />
                <Input
                    title='Model'
                    type='text'
                    {...mkInputProps('model')}
                />
                <Input
                    title='Serial number'
                    type='text'
                    {...mkInputProps('serialNumber')}
                />
                <Input
                    title='Install date'
                    type='date'
                    {...mkInputProps('installDate')}
                />
                <Select
                    title='status'
                    options={statuses}
                    {...mkInputProps('status')}
                />
            </div>
            <div className='flex mt-6 md:mt-10 justify-end'>
                <div className='flex basis-sm shrink gap-3'>
                    <button
                        className={
                            'grow border border-indigo-400 cursor-pointer'
                            + ' px-1 py-2 rounded-xl box-border'
                        }
                        type='button'
                    >
                        Cancel
                    </button>
                    <button
                        className={
                            'grow border-indigo-600 bg-indigo-600 cursor-pointer'
                            + ' px-1 py-2 rounded-xl box-border text-white'
                        }
                        type='submit'
                    >
                        Submit
                    </button>
                </div>
            </div>
        </form>
    </div>
}
