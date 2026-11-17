import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'
import { LIGHT_THEME } from '@/Theme'

describe('Getting leader line default color', () => {
    it('Should use the theme line color', () => {
        const arc = new RenderItemArc()
        const leader = new RenderItemLeaderLine(arc, new RenderItem(arc))

        expect(leader.defaultColor(LIGHT_THEME))
            .toBe(LIGHT_THEME.line)
    })
})
