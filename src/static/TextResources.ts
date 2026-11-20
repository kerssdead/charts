const DEFAULT_TEXTS = {
    exportPNG: 'Save as image...',

    decomposeToTable: 'Show as table...',

    reset: 'Reset',

    exportCSV: 'Save as table...',

    other: 'Other',

    noLabel: '(No label)',

    dataAsTable: 'Data as table',

    total: 'Total',

    noData: 'No data',

    somethingWentWrong: 'Something went wrong',

    noValue: '(no value)',

    value: 'Value',

    name: 'Name',

    share: 'Share',

    filter: 'Filter...',

    copy: 'Copy',

    copied: 'Copied',

    copyFailed: 'Copy failed',

    saveCsv: 'Save as CSV',

    close: 'Close',

    defaultImageName: 'chart',

    defaultTableName: 'table',

    max: 'Max',

    sortAscending: ' ▲',

    sortDescending: ' ▼'
}

export type TextKey = keyof typeof DEFAULT_TEXTS

export type TextOverrides = Partial<Record<TextKey, string>>

let overrides: TextOverrides = {}

export function setTextOverrides(value: TextOverrides | undefined) {
    overrides = value ?? {}
}

const TextResources = {} as Readonly<Record<TextKey, string>>

for (const key of Object.keys(DEFAULT_TEXTS) as TextKey[])
    Object.defineProperty(TextResources, key, { get: () => overrides[key] ?? DEFAULT_TEXTS[key], enumerable: true })

export default TextResources