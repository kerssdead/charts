import Legend from '@/Legend'
import { normalize } from '@/charts/Settings'
import { ChartType, LegendPlace } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import ViewState from '@/charts/ViewState'
import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

jest.mock('@/Theme', () => ({
    canvasBackground: '#ffffff',
    text: '#000000',
    hoverBackground: () => '#ffffff'
}))

globalThis.DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {
    }
} as unknown as typeof DOMRect

const create = (legendPlace: LegendPlace = LegendPlace.Bottom) => {
    const settings = normalize({
        type: ChartType.Pie,
        legendPlace,
        enableLegend: true,
        disableInteractions: false,
        data: {
            values: [
                { id: 'a', label: 'A', value: 1, color: '#ff0000' },
                { id: 'b', label: 'B', value: 2, color: '#00ff00' }
            ]
        }
    } as unknown as ChartSettings)

    const viewState = new ViewState()

    viewState.apply(settings)

    const legend = new Legend(settings, viewState)

    legend.resize(400, 400)

    return legend
}

const update = (legend: Legend, queue: Queue, mouse: { x: number, y: number } | null = null) => {
    return legend.update({ queue, mouse, now: 0 } as unknown as Frame)
}

describe('Updating legend', () => {
    it('Should build legend items after resizing', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        update(legend, queue)

        expect(queue.items.length)
            .toBeGreaterThan(0)
        expect(legend.isMoving)
            .toBe(false)
    })

    it('Should clear the legend when it has no area', () => {
        const settings = normalize({
            type: ChartType.Pie,
            legendPlace: LegendPlace.Bottom,
            enableLegend: true,
            data: { values: [{ id: 'a', label: 'A', value: 1, color: '#ff0000' }] }
        } as unknown as ChartSettings)
        const viewState = new ViewState()

        viewState.apply(settings)

        const legend = new Legend(settings, viewState)
        const queue = new Queue({} as CanvasRenderingContext2D)

        expect(update(legend, queue))
            .toBe(false)
        expect(queue.items)
            .toEqual([])
    })

    it('Should reserve the legend size when it is moving', () => {
        const legend = create()
        const queue = new Queue({} as CanvasRenderingContext2D)

        update(legend, queue)
        legend.applySettings(legend.settings)

        expect(legend.isMoving)
            .toBe(true)
    })

    it('Should update backgrounds when the hover changes', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        update(legend, queue)

        const result = legend.update({ queue, mouse: { x: 170, y: 385 }, now: 1000 } as unknown as Frame)

        expect(typeof result)
            .toBe('boolean')
    })

    it('Should keep leaving entries while moving between settings', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        update(legend, queue)

        const next = normalize({
            type: ChartType.Pie,
            legendPlace: LegendPlace.Bottom,
            enableLegend: true,
            disableInteractions: false,
            data: { values: [{ id: 'a', label: 'A', value: 1, color: '#ff0000' }] }
        } as unknown as ChartSettings)

        legend.applySettings(next)

        const result = update(legend, queue)

        expect(typeof result)
            .toBe('boolean')
        expect(legend.isMoving)
            .toBe(true)
    })
})

describe('Interacting with legend', () => {
    const clickAll = (queue: Queue) => {
        for (const item of queue.items)
            item.onClick?.()
    }

    it('Should report the change when an entry is toggled', () => {
        const onChange = jest.fn()
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        legend.onChange = onChange
        update(legend, queue)

        clickAll(queue)

        expect(onChange)
            .toHaveBeenCalled()
    })

    it('Should report the change when the reset button is clicked', () => {
        const onChange = jest.fn()
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        legend.onChange = onChange
        update(legend, queue)
        clickAll(queue)

        expect(onChange)
            .toHaveBeenCalled()
    })
})

describe('Destroying legend', () => {
    it('Should drop all legend state', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const legend = create()

        update(legend, queue)
        legend.destroy(queue)

        expect(queue.items)
            .toEqual([])
        expect(legend.isMoving)
            .toBe(false)
    })
})
