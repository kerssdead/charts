import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemCells from '@/types/RenderItemCells'
import Units from '@/helpers/Units'
import { packColor } from '@/helpers/PackedColor'
import { ItemFlag } from '@/static/ItemFlag'
import { AnimationTiming } from '@/static/constants/Index'
import HeatMapCellItems from '@/render/heatMap/HeatMapCellItems'
import { getGrid, Grid } from '@/render/heatMap/HeatMapGrid'
import { toUnits } from '@/render/heatMap/HeatMapLayout'
import { CELL_FONT } from '@/render/heatMap/HeatMapConstants'
import { labeled } from './HeatMapTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 5, y: 5 })

const COLORS = Array.from({ length: 256 }, (_, index) => '#' + index.toString(16).padStart(2, '0').repeat(3))

type Context = Partial<ConstructorParameters<typeof HeatMapCellItems>[0]>

const AREA = { x: 0, y: 0, width: 1000, height: 1000 }

const buildGrid = (grid: Grid, area = AREA, extra: Context = {}) => {
    const formatValue = jest.fn((value: number) => `v${ value }`)
    const tooltip = jest.fn((...rows: (string | undefined)[]) => rows.join('|'))

    const cellItems = new HeatMapCellItems({
        units: UNITS,
        colors: COLORS,
        textColor: '#aaaaaa',
        hasImage: false,
        formatValue,
        tooltip,
        ...extra
    })

    const items = QueueItemsBuilder.build(cellItems.getActions(grid, { area }))

    return { items, shape: items[0].shape as RenderItemCells, formatValue, tooltip }
}

const build = (cells: [string, string, number][], area = AREA, extra: Context = {}) => {
    return buildGrid(getGrid(labeled(cells), null), area, extra)
}

const cellsOf = (shape: RenderItemCells) => shape.cells as NonNullable<RenderItemCells['cells']>

const TWO = [['a', 'x', 10], ['b', 'x', 30]] as [string, string, number][]

describe('Getting cell actions', () => {
    it('Should draw all cells as one item', () => {
        const { items, shape } = build(TWO)

        expect(items.map(item => item.key))
            .toEqual(['heat-cells'])
        expect(shape)
            .toBeInstanceOf(RenderItemCells)
    })

    it('Should cover the area in units', () => {
        const area = { x: 10, y: 20, width: 300, height: 400 }

        expect(build(TWO, area).shape.box)
            .toEqual(toUnits(UNITS, area))
    })

    it('Should give the size of the grid', () => {
        const { columns, rows } = cellsOf(build([['a', 'x', 1], ['b', 'y', 2], ['c', 'y', 3]]).shape)

        expect([columns, rows])
            .toEqual([3, 2])
    })

    it('Should take the cell color from the table by its share of the range', () => {
        const { colors } = cellsOf(build(TWO).shape)

        expect([...colors])
            .toEqual([packColor(COLORS[0]), packColor(COLORS[255])])
    })

    it('Should keep the color of the cell when it has one', () => {
        const grid = getGrid(labeled(TWO), null)

        grid.cells[0].color = '#123456'

        expect(cellsOf(buildGrid(grid).shape).colors[0])
            .toBe(packColor('#123456'))
    })

    it('Should leave places without a cell transparent', () => {
        const { colors } = cellsOf(build([['a', 'x', 1], ['b', 'y', 2]]).shape)

        expect([colors[1], colors[2]])
            .toEqual([0, 0])
    })

    it('Should show the highest cell first and the lowest last', () => {
        const { delays } = cellsOf(build([['a', 'x', 10], ['b', 'x', 30], ['c', 'x', 20]]).shape)

        expect([...delays])
            .toEqual([1, 0, .5])
    })

    it('Should not delay a single cell', () => {
        expect(cellsOf(build([['a', 'x', 10]]).shape).delays[0])
            .toBe(0)
    })

    it('Should reveal the cells over the whole ripple', () => {
        const { animation } = build(TWO).items[0]

        expect(animation.initDuration)
            .toBe(AnimationTiming.heatMapInit + AnimationTiming.heatMapRipple)
        expect(animation.appearDuration)
            .toBe(AnimationTiming.heatMapInit + AnimationTiming.heatMapRipple)
    })

    it('Should let the cells fade on their own instead of the whole item', () => {
        expect(build(TWO).items[0].is(ItemFlag.Fading))
            .toBe(false)
    })

    it('Should let cells react to the pointer and open the menu', () => {
        const [item] = build(TWO).items

        expect(item.is(ItemFlag.Interactive))
            .toBe(true)
        expect(item.is(ItemFlag.ContextMenu))
            .toBe(true)
    })

    it('Should resolve the tooltip of a cell only when asked', () => {
        const { shape, tooltip } = build(TWO, { x: 0, y: 0, width: 20, height: 20 })

        expect(tooltip)
            .not.toHaveBeenCalled()
        expect(shape.lookup(0))
            .toBe('x / a|v10')
    })

    it('Should describe nothing where there is no cell', () => {
        expect(build([['a', 'x', 1], ['b', 'y', 2]]).shape.lookup(1))
            .toBeNull()
    })

    it('Should give the data of a cell', () => {
        const grid = getGrid(labeled(TWO), null)

        grid.cells[1].data = { id: 'b' }

        const { shape } = buildGrid(grid)

        expect(shape.dataLookup(1))
            .toEqual({ id: 'b' })
        expect(shape.dataLookup(0))
            .toBeNull()
    })

    it('Should write the value in a cell that is big enough', () => {
        const { labels, labelSize } = cellsOf(build(TWO).shape)

        expect(labels[0]?.text)
            .toBe('v10')
        expect(labelSize)
            .toBe(CELL_FONT)
    })

    it('Should not write the value in a cell that is too small', () => {
        const { shape, formatValue } = build(TWO, { x: 0, y: 0, width: 20, height: 10 })

        expect(cellsOf(shape).labels)
            .toEqual([])
        expect(formatValue)
            .not.toHaveBeenCalled()
    })

    it('Should not write the value in a cell that is too narrow for it', () => {
        expect(cellsOf(build(TWO, { x: 0, y: 0, width: 40, height: 1000 }).shape).labels)
            .toEqual([])
    })

    it('Should write the value in a contrasting color', () => {
        const { labels } = cellsOf(build(TWO).shape)

        expect(labels[1]?.color)
            .toBe('#000000')
        expect(labels[0]?.color)
            .toBe('#ffffff')
    })

    it('Should write the value in the text color over an image', () => {
        expect(cellsOf(build(TWO, AREA, { hasImage: true }).shape).labels[0]?.color)
            .toBe('#aaaaaa')
    })

    it('Should keep contrast over an image when the cell has its own color', () => {
        const grid = getGrid(labeled(TWO), null)

        grid.cells[1].color = '#ffffff'

        expect(cellsOf(buildGrid(grid, AREA, { hasImage: true }).shape).labels[1]?.color)
            .toBe('#000000')
    })
})