import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import { grayScale } from '@/helpers/Color'
import { addLegendEntry } from '@/legend/LegendItems'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemLine from '@/types/RenderItemLine'
import Sector from '@/types/Sector'
import { LIGHT_THEME } from '@/Theme'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const COLOR = '#ff0000'

const build = (value: Sector, isDisabled: boolean) => {
    const items = new QueueItemsBuilder()

    addLegendEntry(items, Units.fromSize(100, 100), { value, label: 'A', x: 0, y: 0, width: 50 }, {
        hover: 0,
        isDisabled,
        onClick: () => {},
        theme: LIGHT_THEME
    })

    const built = items.build()

    return {
        markerColor: built.find(item => item.shape instanceof RenderItemArc)?.color,
        hasStrike: built.some(item => item.shape instanceof RenderItemLine)
    }
}

describe('Adding legend entry', () => {
    it('Should draw enabled entry in its color without strike', () => {
        expect(build(new Sector({ value: 1, color: COLOR }), false))
            .toEqual({ markerColor: COLOR, hasStrike: false })
    })

    it('Should gray out and strike disabled entry', () => {
        expect(build(new Sector({ value: 1, color: COLOR }), true))
            .toEqual({ markerColor: grayScale(COLOR), hasStrike: true })
    })

    it('Should gray out and strike blank entry', () => {
        expect(build(new Sector({ value: 0, color: COLOR }), false))
            .toEqual({ markerColor: grayScale(COLOR), hasStrike: true })
    })
})