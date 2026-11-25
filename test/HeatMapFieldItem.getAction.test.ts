import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemField from '@/types/RenderItemField'
import Units from '@/helpers/Units'
import { ItemFlag } from '@/static/ItemFlag'
import { AnimationTiming } from '@/static/constants/Index'
import HeatMapFieldItem from '@/render/heatMap/HeatMapFieldItem'
import { getField } from '@/render/heatMap/HeatMapField'
import { labeled, points } from './HeatMapTestData'

const UNITS = new Units({ x: 2, y: 3 })

const LUT = new Uint32Array(256)

const AREA = { x: 10, y: 20, width: 300, height: 100 }

const create = (isAlive?: boolean) => {
    return new HeatMapFieldItem({
        units: UNITS,
        lut: LUT,
        isAlive,
        formatValue: value => `v${ Math.round(value) }`,
        tooltip: (...rows) => rows.join('|')
    })
}

const build = (field: ReturnType<typeof getField>, isAlive?: boolean) => {
    const [item] = QueueItemsBuilder.build(create(isAlive).getAction(field, AREA))

    return { item, shape: item.shape as RenderItemField }
}

const LABELED = () => getField(labeled([['a', 'x', 5], ['b', 'y', 9]]), null)

const POINTS = () => getField(points([[50, 50, 8]], { width: 100, height: 100 }), null)

describe('Getting the field action', () => {
    it('Should draw one field item', () => {
        expect(QueueItemsBuilder.build(create().getAction(LABELED(), AREA)).map(item => item.key))
            .toEqual(['heat-field'])
    })

    it('Should cover the area in units', () => {
        expect(build(LABELED()).shape.box)
            .toEqual({ x: 20, y: 60, width: 600, height: 300 })
    })

    it('Should draw the field with the color table', () => {
        const { shape } = build(LABELED())

        expect(shape.field?.lut)
            .toBe(LUT)
        expect(shape.field?.columns)
            .toBe(2)
    })

    it('Should pass on whether the field is alive', () => {
        expect(build(LABELED(), true).shape.field?.alive)
            .toBe(true)
        expect(build(LABELED()).shape.field?.alive)
            .toBeUndefined()
    })

    it('Should reveal over the intro time and the ripple time', () => {
        const { item } = build(LABELED())
        const duration = AnimationTiming.heatMapInit + AnimationTiming.heatMapRipple

        expect(item.animation.initDuration)
            .toBe(duration)
        expect(item.animation.appearDuration)
            .toBe(duration)
    })

    it('Should react to the pointer and open the menu', () => {
        const { item } = build(LABELED())

        expect(item.is(ItemFlag.Interactive))
            .toBe(true)
        expect(item.is(ItemFlag.ContextMenu))
            .toBe(true)
    })

    it('Should describe the nearest cell of a labeled field', () => {
        const { shape } = build(LABELED())

        expect(shape.lookup(.25, .25))
            .toBe('x / a|v5')
        expect(shape.lookup(.75, .75))
            .toBe('y / b|v9')
    })

    it('Should describe nothing where a labeled field has no cell', () => {
        expect(build(LABELED()).shape.lookup(.75, .25))
            .toBeNull()
    })

    it('Should describe the nearest cell at the field edges', () => {
        expect(build(LABELED()).shape.lookup(0, 0))
            .toBe('x / a|v5')
        expect(build(LABELED()).shape.lookup(1, 1))
            .toBe('y / b|v9')
    })

    it('Should describe the position and the value of a point field', () => {
        const text = build(POINTS()).shape.lookup(.5, .5)

        expect(text?.startsWith('x 50, y 50|v'))
            .toBe(true)
    })

    it('Should scale the position by the extent', () => {
        expect(build(POINTS()).shape.lookup(.25, .75)?.startsWith('x 25, y 75|'))
            .toBe(true)
    })
})