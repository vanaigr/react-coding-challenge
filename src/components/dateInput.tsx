import * as R from 'react'

// HTML doesn't support date input with placeholder.
// Some people change type='text' when the input isn't focused,
// but this brakes the input on mobile.

export type DateInputProps
    = R.DetailedHTMLProps<R.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export default function(props: DateInputProps) {
    return <span className={props.className + ' placeholder-date-input relative flex'}>
        <input
            {...props}
            ref={it => {
                if(typeof props.ref === 'function') props.ref(it)
                else if(props.ref) props.ref.current = it

                if(it != null) {
                    it.setAttribute('data-empty', '' + (it.value === ''))
                }
            }}
            className='w-0 h-full grow p-0'
            type='date'
        />
        <span
            className={
                'absolute inset-0 text-gray-500'
                + ' whitespace-nowrap overflow-hidden text-ellipsis'
                + ' pointer-events-none'
            }
        >
            {props.placeholder}
        </span>
    </span>
}
