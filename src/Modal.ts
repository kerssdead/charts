import { Icon, Tag } from '@/static/Enums'

class Modal {
    private readonly modal: HTMLDialogElement

    private isClosed: boolean = false

    constructor(content?: HTMLElement, size?: DOMRect, title?: string) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add(ModalClasses.modal)

        if (size) {
            this.modal.style.width = `${ size.width }px`
            this.modal.style.height = `${ size.height }px`
        }

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

        titleSpan.classList.add(ModalClasses.title)
        titleSpan.textContent = title ?? ''

        const closeButton = document.createElement(Tag.Button)

        closeButton.classList.add(ModalClasses.close)
        closeButton.textContent = Icon.Close

        const header = document.createElement(Tag.Div)

        header.classList.add(ModalClasses.header)

        header.appendChild(titleSpan)
        header.appendChild(closeButton)

        this.modal.appendChild(header)

        closeButton.onclick = () => this.close()
    }

    private setContent(content: HTMLElement | undefined) {
        const container = document.createElement(Tag.Div)

        container.classList.add(ModalClasses.content)

        if (content != undefined)
            container.appendChild(content)

        this.modal.appendChild(container)
    }
}

export default Modal

class ModalClasses {
    static readonly modal = 'o-modal'

    static readonly title = 'o-modal-title'

    static readonly close = 'o-modal-close'

    static readonly header = 'o-modal-header'

    static readonly content = 'o-modal-content'
}