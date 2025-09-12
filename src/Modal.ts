class Modal {
    modal: HTMLDialogElement | undefined

    constructor(content?: HTMLElement) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.style.top = '0'
        this.modal.style.left = '0'

        document.body.appendChild(this.modal)

        this.#setHeader()

        if (content != undefined)
            this.modal.appendChild(content)
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

        closeButton.style.cursor = 'pointer'
        closeButton.innerHTML = 'Close'

        this.modal.appendChild(closeButton)

        closeButton.onclick = () => this.close()
    }
}