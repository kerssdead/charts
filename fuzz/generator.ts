import { ChartType, LegendPlace, PlotAxisType, PlotType } from '../src/static/Enums'

type Json = Record<string, any>

export type FuzzCase = {
    settings: Json

    size: [number, number]
}

const CHART_TYPE_COUNT = ChartType.TreeBar + 1

const PLOT_TYPE_COUNT = PlotType.Area + 1

export function createGenerator(initialSeed: number) {
    let seed = initialSeed

    const rnd = () => {
        seed = (seed + 0x6D2B79F5) | 0

        let t = Math.imul(seed ^ seed >>> 15, 1 | seed)

        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t

        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }

    const ri = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

    const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)]

    const chance = (p: number) => rnd() < p

    const LABELS: ((i: number) => string)[] = [
        i => `Item ${ i }`,
        i => `Very long label number ${ i } that goes on and on and on forever`,
        () => '',
        i => `😀👍🏽 эмодзи ${ i }`,
        () => 'Same',
        i => `${ i }`,
        () => 'A',
        i => `Line\nbreak ${ i }`,
        i => `Supercalifragilisticexpialidocious${ i }`,
        i => `  spaced ${ i }  `
    ]

    function num(scale: number) {
        return pick<() => number>([
            () => rnd() * scale,
            () => rnd() * scale - scale / 2,
            () => 0,
            () => -rnd() * scale,
            () => rnd() * 1e-6,
            () => rnd() * 1e12,
            () => scale,
            () => Math.round(rnd() * 10),
            () => 0.001 * rnd()
        ])()
    }

    function gen(forcedType?: ChartType): FuzzCase {
        const scale = pick([1, 10, 1000, 1e6, 0.01, 1e9])
        const labelFn = pick(LABELS)
        const count = pick([0, 1, 1, 2, 3, 5, 8, 15, 30, 60])
        const valueMode = pick(['random', 'same', 'zero', 'mixed'])
        const v = () => valueMode === 'zero' ? 0 : valueMode === 'same' ? scale : num(scale)
        const color = () => chance(0.5) ? undefined : '#' + ri(0, 0xffffff).toString(16).padStart(6, '0')
        const sector = (i: number) => ({
            value: chance(0.1) ? -Math.abs(v()) : Math.abs(v()),
            label: labelFn(i),
            color: color(),
            disabled: chance(0.05),
            hideInLegend: chance(0.05),
            data: { Id: i, Name: 's' + i, Value: i }
        })
        const type: ChartType = forcedType ?? ri(0, CHART_TYPE_COUNT - 1)
        const data: Json = {}

        switch (type) {
            case ChartType.Plot: {
                const xType = ri(PlotAxisType.Number, PlotAxisType.Text)
                const points = pick([0, 1, 2, 5, 12, 40, 150, 1000])
                const plotType = pick([PlotType.Line, PlotType.Line, PlotType.AttentionLine, PlotType.Column, PlotType.Bar, PlotType.StackingColumn])
                const mixed = chance(0.3)
                const order = pick(['sorted', 'sorted', 'shuffled', 'duplicates'])

                data.values = Array.from({ length: count }, (_, i) => ({
                    type: mixed ? ri(0, PLOT_TYPE_COUNT - 1) : plotType,
                    hideInLegend: chance(0.05),
                    disabled: chance(0.05),
                    label: labelFn(i),
                    width: pick([undefined, 0, 1, 3, 10, 50]),
                    dash: pick([undefined, [], [5, 5], [1, 3]]),
                    color: color(),
                    data: { Id: i, Name: 'n' + i, Value: i },
                    values: Array.from({ length: chance(0.2) ? ri(0, points) : points }, (_, k) => order === 'shuffled' ? ri(0, points) : order === 'duplicates' ? Math.floor(k / 2) : k).map(j => ({
                        x: xType === PlotAxisType.Date ? new Date(Date.UTC(2025, 0, 1) + j * pick([86400000, 3600000, 2592000000])).toISOString()
                            : xType === PlotAxisType.Text ? pick([`Cat ${ j }`, `Long category name ${ j } here`, `${ j }`]) : (chance(0.1) ? j * scale : j),
                        y: chance(0.05) ? String(v()) : v(),
                        label: chance(0.1) ? labelFn(j) : undefined,
                        data: { Id: j, Name: 'p' + j, Value: j }
                    }))
                }))

                Object.assign(data, {
                    xType,
                    xTitle: chance(0.4) ? pick(['X axis title', 'A very long x axis title that keeps going and going']) : null,
                    yTitle: chance(0.4) ? pick(['Y axis title', 'A very long y axis title that keeps going and going']) : null,
                    simple: chance(0.15),
                    shortLabels: chance(0.3),
                    yMax: chance(0.15) ? pick<number | string>([0, 10, scale, -5, '', '50']) : undefined
                })

                break
            }

            case ChartType.Pie:
                data.values = Array.from({ length: count }, (_, i) => ({
                    value: Math.abs(v()),
                    label: labelFn(i),
                    color: color(),
                    hideInLegend: chance(0.05),
                    disabled: chance(0.05),
                    data: { Id: i, Name: 's' + i, Value: i }
                }))

                Object.assign(data, {
                    innerRadius: pick([0, 0, 30, 50, 80, 100, 120, -10]),
                    innerTitle: pick(['', 'Total', 'A very long inner title text here', '😀 Σ']),
                    labelPercent: chance(0.3)
                })

                break

            case ChartType.Gauge: {
                const min = pick([0, 0, -100, 10, scale])
                const max = pick([100, scale, min, min - 10, 1000])

                data.values = Array.from({ length: Math.min(count, pick([1, 1, 2, count])) }, (_, i) => ({
                    value: pick([v(), min, max, max * 2, min - 50]),
                    label: labelFn(i),
                    color: color()
                }))

                Object.assign(data, { min, max, innerRadius: pick([0, 50, 80, 100, -10]), enableTrack: chance(0.5) })

                break
            }

            case ChartType.TreeMap:
                data.values = Array.from({ length: count }, (_, i) => ({
                    label: labelFn(i),
                    color: color(),
                    value: chance(0.3) ? Math.abs(v()) : undefined,
                    data: { Id: i, Name: 'g' + i, Value: i },
                    sectors: chance(0.2) ? undefined : Array.from({ length: pick([0, 1, 3, 10, 40]) }, (_, j) => ({
                        value: chance(0.1) ? -Math.abs(v()) : Math.abs(v()),
                        label: labelFn(j),
                        data: { Id: j, Name: 'c' + j, Value: j }
                    }))
                }))

                Object.assign(data, { padding: pick([0, 2, 10, 40, -5]), gap: pick([0, 2, 10, 40, -5]) })

                break

            case ChartType.SegmentedBar:
                data.values = Array.from({ length: count }, (_, i) => sector(i))

                data.stops = Array.from({ length: pick([0, 0, 1, 2, 3, 6]) }, (_, i) => ({
                    value: pick<number | string>([v(), Math.abs(v()), `${ ri(-10, 150) }%`, '%', '', 'abc', 0, scale]),
                    label: labelFn(i),
                    color: color()
                }))

                Object.assign(data, {
                    leftLabel: chance(0.4) ? labelFn(0) : undefined,
                    rightLabel: chance(0.4) ? labelFn(1) : undefined,
                    percentageMode: chance(0.3)
                })

                break

            case ChartType.TreeBar: {
                const columnKeys = Array.from({ length: pick([0, 0, 1, 2, 4]) }, (_, i) => `col${ i }`)
                const cellValue = () => pick<string | number>([v(), String(v()), '1 234,5', '', 'n/a', `${ ri(0, 100) }%`])
                const depth = pick([1, 2, 3, 5])
                const row = (i: number, level: number): Json => ({
                    label: labelFn(i),
                    subLabel: chance(0.3) ? labelFn(i + 1) : undefined,
                    barLabel: chance(0.2) ? labelFn(i + 2) : undefined,
                    color: color(),
                    expanded: chance(0.5) ? chance(0.5) : undefined,
                    parts: Array.from({ length: pick([0, 1, 2, 3, 5]) }, (_, j) => sector(j)),
                    cells: chance(0.1) ? undefined : Object.fromEntries(columnKeys.map(key => [key, cellValue()])),
                    data: { Id: i, Name: 'r' + i, Value: i },
                    children: level < depth && chance(0.5)
                        ? Array.from({ length: pick([0, 1, 3, 8]) }, (_, k) => row(k, level + 1))
                        : undefined
                })

                data.values = Array.from({ length: count }, (_, i) => row(i, 0))

                Object.assign(data, {
                    columns: chance(0.1) ? undefined : columnKeys.map(key => ({ key, title: labelFn(0) })),
                    sortColumn: chance(0.3) ? pick([...columnKeys, 'missing', '']) : undefined,
                    sortDescending: chance(0.3) ? chance(0.5) : undefined,
                    numberLocale: chance(0.2) ? pick(['en-US', 'ru-RU', 'de-DE', 'xx']) : undefined
                })

                break
            }
        }

        const multi = chance(0.12)
        const settings: Json = {
            type,
            data,
            title: chance(0.4) ? pick(['Title', 'An extremely long title that probably should be truncated somewhere along the way ok', 'Pneumonoultramicroscopicsilicovolcanoconiosis', '😀👍🏽 эмодзи']) : null,
            enableTooltip: chance(0.7),
            enableLegend: chance(0.6),
            enableOther: chance(0.3),
            staticMode: chance(0.1),
            enableMove: chance(0.3),
            disableInteractions: chance(0.05),
            disableMenu: chance(0.1),
            baseColor: chance(0.2) ? pick(['#ff0000', '#000000', '#ffffff', '#3366cc']) : null,
            templateId: chance(0.15) ? 'tpl' : null,
            valuePostfix: chance(0.2) ? pick(['%', ' kg', ' very long postfix', '']) : undefined,
            legendPlace: chance(0.5) ? ri(LegendPlace.Bottom, LegendPlace.Right) : undefined,
            contextMenu: chance(0.2) ? [{ text: 'Button 1' }, { text: 'Button 2' }] : undefined,
            width: chance(0.05) ? pick(['400', '300px', '50%']) : undefined,
            height: chance(0.05) ? pick(['250', '200px', '50%']) : undefined,
            dark: chance(0.25)
        }

        if (multi) {
            settings.charts = Array.from({ length: pick([2, 3, 4, 5, 9]) }, (_, i) => {
                const chartType = (type + i) % CHART_TYPE_COUNT

                return { type: chartType, title: `Chart ${ i }`, data: gen(chartType).settings.data }
            })

            settings.columns = pick([undefined, 1, 2, 3, 4])
        }

        const size = pick<[number, number]>([[800, 500], [300, 200], [120, 80], [1400, 900], [50, 50], [600, 1000], [200, 600], [1, 1], [320, 480], [2000, 200], [1000, 300]])

        return { settings, size }
    }

    return {
        gen,
        rnd,
        ri,
        pick,
        chance,
        get seed() {
            return seed
        },
        set seed(value: number) {
            seed = value
        }
    }
}