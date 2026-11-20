import { createCanvas } from '@/helpers/Canvas'
import { AriaRole, Attribute } from '@/static/Enums'
import { installFakeDocument } from './FakeDocument'

describe('Creating canvas', () => {
    it('Should expose the canvas as an image', () => {
        installFakeDocument()

        expect(createCanvas().getAttribute(Attribute.Role))
            .toBe(AriaRole.Img)
    })
})