import TextResources from '@/static/TextResources'
import { Events, TableClasses, Tag } from '@/static/Enums'
import { button, div } from '@/export/TableElements'

const COPIED_FEEDBACK_DURATION = 1500

export type TableToolbarOptions = {
    canFilter: boolean

    onFilter: (query: string) => void

    getText: () => string

    onSave: () => void
}

export default class TableToolbar {
    static create(options: TableToolbarOptions) {
        const toolbar = div(TableClasses.Toolbar)

        if (options.canFilter) {
            const filter = document.createElement(Tag.Input)

            filter.classList.add(TableClasses.Filter)
            filter.type = 'search'
            filter.placeholder = TextResources.filter
            filter.addEventListener(Events.Input, () => options.onFilter(filter.value))

            toolbar.append(filter)
        }

        toolbar.append(
            button(TextResources.copy, element => {
                navigator.clipboard.writeText(options.getText()).then(() => {
                    element.textContent = TextResources.copied

                    setTimeout(() => element.textContent = TextResources.copy, COPIED_FEEDBACK_DURATION)
                })
            }),
            button(TextResources.saveCsv, options.onSave)
        )

        return toolbar
    }
}