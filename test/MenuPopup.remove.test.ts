import { installMenuPopup } from './MenuPopupTestData'

describe('Removing menu popup', () => {
    it('Should remove the popup element', () => {
        const { body, popup, element } = installMenuPopup()

        popup.show({ x: 10, y: 20 })
        popup.remove()

        expect(body.elements)
            .not.toContain(element)
        expect(element.isConnected)
            .toBe(false)
    })

    describe('restoring focus', () => {
        class FakeFocusable {
            isConnected = true

            focus = jest.fn()
        }

        beforeEach(() => {
            Object.assign(globalThis, { HTMLElement: FakeFocusable })
        })

        afterEach(() => {
            delete (globalThis as Record<string, unknown>).HTMLElement
        })

        const showWithFocus = (previous: unknown) => {
            const environment = installMenuPopup()

            Object.assign(document, { activeElement: previous })
            environment.popup.show({ x: 0, y: 0 })
            Object.assign(document, { activeElement: environment.buttons[0] })

            return environment
        }

        it('Should return focus to the previously focused element', () => {
            const previous = new FakeFocusable()

            showWithFocus(previous).popup.remove()

            expect(previous.focus)
                .toHaveBeenCalledWith({ preventScroll: true })
        })

        it('Should not return focus to a detached element', () => {
            const previous = new FakeFocusable()

            previous.isConnected = false
            showWithFocus(previous).popup.remove()

            expect(previous.focus)
                .not.toHaveBeenCalled()
        })

        it('Should not return focus to something that is not an element', () => {
            expect(() => showWithFocus(null).popup.remove())
                .not.toThrow()
        })

        it('Should leave focus alone when it moved outside the popup', () => {
            const previous = new FakeFocusable()
            const { popup } = showWithFocus(previous)

            Object.assign(document, { activeElement: new FakeFocusable() })
            popup.remove()

            expect(previous.focus)
                .not.toHaveBeenCalled()
        })
    })
})