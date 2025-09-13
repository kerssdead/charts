class Modal {
    modal: HTMLDialogElement | undefined

    #content: HTMLDivElement | undefined

    constructor(content?: HTMLElement) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add('o-modal')

        this.modal.oncancel = () => this.close()

        document.body.appendChild(this.modal)

        this.#setHeader()

        this.#setContent(content)
    }

    open() {
        if (this.modal == undefined)
            Helpers.Errors.throw(ErrorType.ElementNotExist)

        this.modal.showModal()
    }

    close()  {
        if (this.modal == undefined)
            Helpers.Errors.throw(ErrorType.ElementNotExist)

        this.modal.close()

        this.modal.remove()

        this.modal = undefined
    }

    #setHeader() {
        if (this.modal == undefined)
            Helpers.Errors.throw(ErrorType.ElementNotExist)

        let closeButton = document.createElement('button')

        closeButton.classList.add('o-modal-close')
        closeButton.innerHTML = 'x'

        this.modal.appendChild(closeButton)

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