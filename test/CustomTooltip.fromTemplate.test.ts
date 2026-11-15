import CustomTooltip from '@/renderer/CustomTooltip'
import { FakeTemplate, installCustomTooltipEnvironment } from './CustomTooltipTestData'

describe('Building custom tooltip from template', () => {
    it('Should return nothing for a missing template', () => {
        installCustomTooltipEnvironment()

        Object.assign(globalThis, { HTMLTemplateElement: class { } })

        expect(CustomTooltip.fromTemplate('missing'))
            .toBeNull()
    })

    it('Should fill the template placeholders with escaped data', () => {
        installCustomTooltipEnvironment()

        Object.assign(globalThis, { HTMLTemplateElement: FakeTemplate })

        const fakeDocument = globalThis as unknown as {
            document: { getElementById: (id: string) => FakeTemplate }
        }

        fakeDocument.document.getElementById = () => new FakeTemplate()

        const fill = CustomTooltip.fromTemplate('tooltip')

        expect(fill)
            .not.toBeNull()
        expect(fill?.({ Name: 'First & Last' }))
            .toBe('<b>First &amp; Last</b>')
        expect(fill?.({ Name: 'Second' }))
            .toBe('<b>Second</b>')
    })
})