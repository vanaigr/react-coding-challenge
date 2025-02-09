import type { HeaderContext, RowData } from '@tanstack/react-table'
import type { ReactElement } from 'react'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filter: (ctx: HeaderContext<TData, TValue>) => ReactElement
    }
}
