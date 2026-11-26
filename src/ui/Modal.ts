import { Attribute, Icon, Tag } from '@/static/Enums'
import TextResources from '@/static/TextResources'
import { getFontFamily } from '@/static/Typography'

const enum ModalClasses {
    Modal = 'o-modal',

    Title = 'o-modal-title',

    Close = 'o-modal-close',

    Header = 'o-modal-header',

    Content = 'o-modal-content',

    Dark = 'o-dark'
}

let titleCount = 0

class Modal {
    private readonly modal: HTMLDialogElement

    private isClosed = false

    constructor(content?: HTMLElement, title?: string, isDark = false) {
        this.modal = document.createElement(Tag.Dialog)

        this.modal.classList.add(ModalClasses.Modal)
        this.modal.style.fontFamily = getFontFamily()

        if (isDark)
            this.modal.classList.add(ModalClasses.Dark)

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

        if (title) {
            titleSpan.id = `${ ModalClasses.Title }-${ ++titleCount }`
            this.modal.setAttribute(Attribute.AriaLabelledBy, titleSpan.id)
        }

        const closeButton = document.createElement(Tag.Button)

        closeButton.classList.add(ModalClasses.Close)
        closeButton.textContent = Icon.Close
        closeButton.setAttribute(Attribute.AriaLabel, TextResources.close)

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

        if (content !== undefined)
            container.appendChild(content)

        this.modal.appendChild(container)
    }
}

export default Modal