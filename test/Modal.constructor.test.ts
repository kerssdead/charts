import Modal from '@/ui/Modal'
import { FakeElement, installFakeDocument } from './FakeDocument'

const create = (isDark?: boolean) => {
    const body = installFakeDocument()

    new Modal(undefined, 'Title', isDark)

    return body.elements[0] as FakeElement
}

describe('Creating modal', () => {
    it('Should not use the dark theme by default', () => {
        expect([...create().classes])
            .toEqual(['o-modal'])
    })

    it('Should use the dark theme when requested', () => {
        expect([...create(true).classes])
            .toEqual(['o-modal', 'o-dark'])
    })
})