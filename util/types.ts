export type ValuesUnion<T extends readonly string[]> = { [K in T[number]]: K }[T[number]]
