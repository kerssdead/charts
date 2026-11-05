import { caption } from '@/export/TableElements'
import { TableClasses } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

describe('Creating table caption', () => {
    beforeEach(installFakeDocument)

    it('Should show the title with the caption class', () => {
        const element = caption('Revenue') as unknown as FakeElement

        expect([element.textContent, [...element.classes]])
            .toEqual(['Revenue', [TableClasses.Caption]])
    })
})