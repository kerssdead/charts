import { asNumberCell, cell } from '@/export/TableElements'
import { TableClasses } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

describe('Marking table cell as number', () => {
    beforeEach(installFakeDocument)

    it('Should add the number class and return the same element', () => {
        const element = cell('10')

        const result = asNumberCell(element) as unknown as FakeElement

        expect([result === element as unknown, result.classList.contains(TableClasses.Number)])
            .toEqual([true, true])
    })
})