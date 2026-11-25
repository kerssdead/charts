import { getField } from '@/render/heatMap/HeatMapField'
import { Diffusion, diffuse } from '@/helpers/FieldBlur'
import { labeled, points } from './HeatMapTestData'

const EXTENT = { width: 100, height: 100 }

describe('Getting a field', () => {
    it('Should place labeled cells at their nodes', () => {
        const field = getField(labeled([['a', 'x', 4], ['b', 'y', 9]]), null)

        expect([field.columns, field.rows])
            .toEqual([2, 2])
        expect([...field.values])
            .toEqual([4, 0, 0, 9])
    })

    it('Should leave nodes without a cell empty', () => {
        const field = getField(labeled([['a', 'x', 4], ['b', 'y', 9]]), null)

        expect(field.cells?.[0]?.value)
            .toBe(4)
        expect(field.cells?.[1])
            .toBeUndefined()
    })

    it('Should give the range of present cells only', () => {
        const field = getField(labeled([['a', 'x', 4], ['b', 'y', 9]]), null)

        expect([field.min, field.max])
            .toEqual([4, 9])
    })

    it('Should not diffuse labeled cells', () => {
        expect(getField(labeled([['a', 'x', 4]]), null).diffusion)
            .toBeUndefined()
    })

    it('Should keep the point values spread by the radius', () => {
        const field = getField(points([[50, 50, 6]], { ...EXTENT, radius: 20 }), null)

        expect(field.diffusion)
            .toBeDefined()
        expect([...field.values])
            .toEqual([...diffuse(field.diffusion as Diffusion, 1, field)])
    })

    it('Should conserve the point values in the sources', () => {
        const field = getField(points([[10, 10, 3], [55, 70, 4], [90, 20, 5]], EXTENT), null)
        const total = [...(field.diffusion as Diffusion).sources].reduce((sum, value) => sum + value, 0)

        expect(total)
            .toBeCloseTo(12)
    })

    it('Should ignore points outside the extent', () => {
        const field = getField(points([[10, 10, 3], [500, 10, 100]], EXTENT), null)
        const total = [...(field.diffusion as Diffusion).sources].reduce((sum, value) => sum + value, 0)

        expect(total)
            .toBeCloseTo(3)
    })

    it('Should convert the radius to cells', () => {
        const field = getField(points([[50, 50, 1]], { ...EXTENT, radius: 20 }), null)

        expect([field.diffusion?.sigmaX, field.diffusion?.sigmaY])
            .toEqual([2, 2])
    })

    it('Should default the radius to one and a half cells', () => {
        const field = getField(points([[50, 50, 1]], EXTENT), null)

        expect(field.diffusion?.sigmaX)
            .toBeCloseTo(1.5)
    })

    it('Should start the range of points at zero', () => {
        const field = getField(points([[50, 50, 6]], EXTENT), null)

        expect(field.min)
            .toBe(0)
        expect(field.max)
            .toBe(Math.max(...field.values))
    })

    it('Should take the extent from the image when the data has none', () => {
        const field = getField(points([[1, 1, 1]]), { width: 300, height: 100 })

        expect(field.extent)
            .toEqual({ width: 300, height: 100 })
    })
})