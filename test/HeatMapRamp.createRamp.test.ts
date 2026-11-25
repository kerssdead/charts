import { createRamp } from '@/render/heatMap/HeatMapRamp'
import { DEFAULT_OPACITY, MIN_RAMP_STRENGTH } from '@/render/heatMap/HeatMapConstants'
import { blendColors } from '@/helpers/Color'
import { labeled } from './HeatMapTestData'

const BACKGROUND = '#222222'

const ramp = (extra: object = {}) => createRamp(labeled([['a', 'x', 1]], { color: '#ff0000', ...extra }), BACKGROUND)

describe('Creating a color ramp', () => {
    it('Should fade from the background to the color', () => {
        expect(ramp()(1))
            .toBe('#ff0000')
        expect(ramp()(0))
            .toBe(blendColors(BACKGROUND, '#ff0000', MIN_RAMP_STRENGTH))
    })

    it('Should never start exactly at the background', () => {
        expect(ramp()(0))
            .not.toBe(BACKGROUND)
    })

    it('Should fade the opacity over an image instead', () => {
        const withImage = ramp({ image: 'plan.png' })

        expect(withImage(1))
            .toBe('#ff0000' + Math.round(DEFAULT_OPACITY * 255).toString(16))
        expect(withImage(0).length)
            .toBe(9)
    })

    it('Should limit the opacity over an image', () => {
        expect(ramp({ image: 'plan.png', opacity: .5 })(1))
            .toBe('#ff000080')
        expect(ramp({ image: 'plan.png', opacity: 5 })(1))
            .toBe('#ff0000ff')
    })

    it('Should pass through the given colors', () => {
        const colored = ramp({ colors: ['#0000ff', '#00ff00', '#ff0000'] })

        expect(colored(0))
            .toBe('#0000ff')
        expect(colored(.5))
            .toBe('#00ff00')
        expect(colored(1))
            .toBe('#ff0000')
    })

    it('Should blend between the given colors', () => {
        expect(ramp({ colors: ['#000000', '#ffffff'] })(.5))
            .toBe('#808080')
    })

    it('Should use one given color for every ratio', () => {
        const single = ramp({ colors: ['#123456'] })

        expect(single(0))
            .toBe('#123456')
        expect(single(1))
            .toBe('#123456')
    })

    it('Should clamp ratios outside 0..1', () => {
        const colored = ramp({ colors: ['#000000', '#ffffff'] })

        expect(colored(-3))
            .toBe('#000000')
        expect(colored(7))
            .toBe('#ffffff')
    })

    it('Should make the low end transparent over an image with given colors', () => {
        const colored = ramp({ colors: ['#0000ff', '#ff0000'], image: 'plan.png' })

        expect(colored(0).slice(7))
            .toBe('00')
        expect(colored(1).slice(7))
            .toBe(Math.round(DEFAULT_OPACITY * 255).toString(16))
    })
})