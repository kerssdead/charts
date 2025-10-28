import { Errors } from 'helpers/Errors'
import { ErrorType, Icon, Tag } from 'static/Enums'

export class Modal {
    modal: HTMLDialogElement | undefined

    #content: HTMLDivElement | undefined

    constructor(content?: HTMLElement, size?: DOMRect, title?: string) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add(ModalClasses.modal)

        if (size) {
            this.modal.style.width = `${ size.width }px`
            this.modal.style.height = `${ size.height }px`
        }

        this.modal.oncancel = () => this.close()

        document.body.appendChild(this.modal)

        this.#setHeader(title)

        this.#setContent(content)
    }

    open() {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist)

        this.modal!.showModal()
    }

    close() {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist)

        this.modal!.close()

        this.modal!.remove()

        this.modal = undefined
    }

    #setHeader(title: string | undefined) {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist)

        let titleSpan = document.createElement(Tag.Span)

        titleSpan.classList.add(ModalClasses.title)
        titleSpan.innerHTML = title ?? ''

        let closeButton = document.createElement(Tag.Button)

        closeButton.classList.add(ModalClasses.close)
        closeButton.innerHTML = Icon.Close

        let header = document.createElement(Tag.Div)

        header.classList.add(ModalClasses.header)

        header.appendChild(titleSpan)
        header.appendChild(closeButton)

        this.modal!.appendChild(header)

        closeButton.onclick = () => this.close()
    }

    #setContent(content: HTMLElement | undefined) {
        if (this.#content == undefined) {
            this.#content = document.createElement(Tag.Div)

            this.#content.classList.add(ModalClasses.content)

            this.modal?.appendChild(this.#content)
        }

        if (content != undefined)
            this.#content.appendChild(content)
    }
}

class ModalClasses {
    static modal = 'o-modal'

    static title = 'o-modal-title'

    static close = 'o-modal-close'

    static header = 'o-modal-header'

    static content = 'o-modal-content'
}