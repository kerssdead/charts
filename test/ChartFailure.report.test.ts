import ChartFailure from '@/ui/ChartFailure'
import TextResources from '@/static/TextResources'
import { FakeElement, installFakeDocument } from './FakeDocument'

const error = new Error('Broken')

let host: FakeElement

let failure: ChartFailure

let consoleError: jest.SpyInstance

beforeEach(() => {
    installFakeDocument()

    host = new FakeElement('div')
    failure = new ChartFailure(host as unknown as HTMLElement)
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    consoleError.mockRestore()
})

describe('Reporting chart failure', () => {
    it('Should show the error message and log the error', () => {
        failure.report(error, {})

        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
        expect(consoleError)
            .toHaveBeenCalledWith('OCharts failed:', error, {})
    })

    it('Should become active', () => {
        failure.report(error, {})

        expect(failure.isActive)
            .toBe(true)
    })

    it('Should pass the error to onError', () => {
        const onError = jest.fn()

        failure.report(error, {}, onError)

        expect(onError)
            .toHaveBeenCalledWith(error)
    })

    it('Should not show the error message when onError handles the error', () => {
        failure.report(error, {}, () => true)

        expect(host.children)
            .toEqual([])
    })

    it('Should show the error message when onError does not return true', () => {
        failure.report(error, {}, () => {})

        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
    })

    it('Should show the error message and log the handler error when onError throws', () => {
        const handlerError = new Error('Handler')

        failure.report(error, {}, () => {
            throw handlerError
        })

        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
        expect(consoleError)
            .toHaveBeenCalledWith(handlerError)
    })

    it('Should not show the error message when onError clears the failure', () => {
        failure.report(error, {}, () => failure.clear())

        expect(host.children)
            .toEqual([])
    })
})