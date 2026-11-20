import { floatingPanelHighlight } from '@/helpers/FloatingStyle'

describe('Getting floating panel highlight', () => {
    it('Should use an inset top highlight without a drop shadow', () => {
        expect([floatingPanelHighlight(false), floatingPanelHighlight(true)])
            .toEqual(['inset 0 1px 0 rgb(255 255 255 / .9)', 'inset 0 1px 0 rgb(255 255 255 / .18)'])
    })
})