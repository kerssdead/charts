class Modal {
    modal: HTMLDialogElement | undefined

    #content: HTMLDivElement | undefined

    constructor(content?: HTMLElement, size?: DOMRect) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add('o-modal')

        if (size) {
            this.modal.style.width = `${size.width}px`
            this.modal.style.height = `${size.height}px`
        }

        this.modal.oncancel = () => this.close()

        document.body.appendChild(this.modal)

        this.#setHeader()

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

    #setHeader() {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist)

        let closeButton = document.createElement('button')

        closeButton.classList.add('o-modal-close')
        closeButton.innerHTML = 'x'

        this.modal!.appendChild(closeButton)

        closeButton.onclick = () => this.close()
    }

    #setContent(content: HTMLElement | undefined) {
        if (this.#content == undefined) {
            this.#content = document.createElement(Tag.Div)

            this.#content.classList.add('o-modal-content')

            this.modal?.appendChild(this.#content)
        }

        if (content != undefined)
            this.#content.appendChild(content)
    }
}