import TextResources from '@/static/TextResources'
import { Attribute, Tag } from '@/static/Enums'

let hintCount = 0

export default class TableHint {
    private readonly canvas: HTMLCanvasElement

    private readonly element: HTMLElement

    constructor(parent: HTMLElement, canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.element = document.createElement(Tag.Span)
        this.element.id = `o-table-hint-${ ++hintCount }`

        Object.assign(this.element.style, {
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap'
        })

        parent.append(this.element)
    }

    apply(isAvailable: boolean) {
        if (isAvailable) {
            this.element.textContent = TextResources.decomposeToTable
            this.canvas.setAttribute(Attribute.AriaDescribedBy, this.element.id)
        } else {
            this.element.textContent = ''
            this.canvas.removeAttribute(Attribute.AriaDescribedBy)
        }
    }

    remove() {
        this.element.remove()
    }
}