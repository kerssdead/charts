import { Events, Tag } from '@/static/Enums'

export default class TableColumnHighlight {
    static attach(table: HTMLElement) {
        const highlight = document.createElement(Tag.Div)
        highlight.classList.add('o-table-column-highlight')
        highlight.hidden = true

        let highlightedCell: HTMLElement | null = null

        const hide = () => {
            highlight.hidden = true
            highlightedCell = null
        }

        table.addEventListener(Events.PointerMove, event => {
            const cell = (event.target as HTMLElement).closest<HTMLElement>('.o-table-row > div')

            if (!cell) {
                hide()
                return
            }

            if (cell === highlightedCell)
                return

            highlightedCell = cell

            highlight.style.left = `${ cell.offsetLeft }px`
            highlight.style.width = `${ cell.offsetWidth }px`
            highlight.style.height = `${ table.scrollHeight }px`
            highlight.hidden = false
        })

        table.addEventListener(Events.PointerLeave, hide)

        table.append(highlight)
    }
}