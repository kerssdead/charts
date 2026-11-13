import ChartFailure from '@/ui/ChartFailure'
import { FakeElement, installFakeDocument } from './FakeDocument'

let host: FakeElement

let failure: ChartFailure

beforeEach(() => {
    installFakeDocument()
    jest.spyOn(console, 'error').mockImplementation(() => {})

    host = new FakeElement('div')
    failure = new ChartFailure(host as unknown as HTMLElement)
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('Clearing chart failure', () => {
    it('Should remove the error message', () => {
        failure.report(new Error('Broken'), {})
        failure.clear()

        expect(host.children)
            .toEqual([])
    })

    it('Should become inactive', () => {
        failure.report(new Error('Broken'), {})
        failure.clear()

        expect(failure.isActive)
            .toBe(false)
    })

    it('Should do nothing when there is no failure', () => {
        failure.clear()

        expect(failure.isActive)
            .toBe(false)
    })
})