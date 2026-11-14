import { guard } from '@/helpers/Errors'

describe('Guarding an action', () => {
    it('Should run the action', () => {
        const action = jest.fn()

        guard(action, () => {})

        expect(action)
            .toHaveBeenCalledTimes(1)
    })

    it('Should pass a thrown error to the handler instead of throwing', () => {
        const error = new Error('Broken')
        const onError = jest.fn()

        expect(() => guard(() => { throw error }, onError))
            .not.toThrow()
        expect(onError)
            .toHaveBeenCalledWith(error)
    })

    it('Should not call the handler when the action succeeds', () => {
        const onError = jest.fn()

        guard(() => {}, onError)

        expect(onError)
            .not.toHaveBeenCalled()
    })
})