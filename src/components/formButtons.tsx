import { useRouter } from 'next/navigation'

export type FormButtonsProps = {
    submitName: string,
    canSubmit: boolean,
}
export default function FormButtons({ submitName, canSubmit }: FormButtonsProps) {
    const navigate = useRouter()

    const submitC = canSubmit
            ? ' cursor-pointer border-indigo-500 bg-indigo-500'
            : ' border-indigo-300 bg-indigo-200'

    return <div className='flex justify-center'>
        <div className='grow max-w-5xl flex mt-6 md:mt-10 md:justify-end justify-center'>
            <div className='flex shrink gap-3'>
                <button
                    className={
                        'w-40 shrink border border-indigo-500 cursor-pointer'
                            + ' px-1 py-2 rounded-xl box-border'
                    }
                    type='button'
                    onClick={() => navigate.back()}
                >
                    Cancel
                </button>
                <button
                    className={
                        'w-40 shrink px-1 py-2 rounded-xl box-border text-white'
                            + submitC
                    }
                    aria-disabled={!canSubmit}
                    type='submit'
                >
                    {submitName}
                </button>
            </div>
        </div>
    </div>
}
