import { Icon, Tag } from '@/static/Enums'

const enum ModalClasses {
    Modal = 'o-modal',

    Title = 'o-modal-title',

    Close = 'o-modal-close',

    Header = 'o-modal-header',

    Content = 'o-modal-content'
}

class Modal {
    private readonly modal: HTMLDialogElement

    private isClosed: boolean = false

    constructor(content?: HTMLElement, title?: string) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add(ModalClasses.Modal)

        this.modal.oncancel = () => this.close()

        document.body.appendChild(this.modal)

        this.setHeader(title)

        this.setContent(content)
    }

    open() {
        this.modal.showModal()
    }

    close() {
        if (this.isClosed)
            return

        this.isClosed = true

        this.modal.close()

        this.modal.remove()
    }

    private setHeader(title: string | undefined) {
        const titleSpan = document.createElement(Tag.Span)

        titleSpan.classList.add(ModalClasses.Title)
        titleSpan.textContent = title ?? ''

        const closeButton = document.createElement(Tag.Button)

        closeButton.classList.add(ModalClasses.Close)
        closeButton.textContent = Icon.Close

        const header = document.createElement(Tag.Div)

        header.classList.add(ModalClasses.Header)

        header.appendChild(titleSpan)
        header.appendChild(closeButton)

        this.modal.appendChild(header)

        closeButton.onclick = () => this.close()
    }

    private setContent(content: HTMLElement | undefined) {
        const container = document.createElement(Tag.Div)

        container.classList.add(ModalClasses.Content)

        if (content != undefined)
            container.appendChild(content)

        this.modal.appendChild(container)
    }
}

export default Modal