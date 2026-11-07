import TextResources from '@/static/TextResources'
import { Events, TableClasses, Tag } from '@/static/Enums'
import { button, div } from '@/export/TableElements'

const COPY_FEEDBACK_DURATION = 1500

const copyResultTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

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
            button(TextResources.copy, copyButton => TableToolbar.copyText(copyButton, options.getText())),
            button(TextResources.saveCsv, options.onSave)
        )

        return toolbar
    }

    private static async copyText(copyButton: HTMLElement, text: string) {
        try {
            await navigator.clipboard.writeText(text)

            TableToolbar.showCopyResult(copyButton, TextResources.copied)
        } catch {
            TableToolbar.showCopyResult(copyButton, TextResources.copyFailed)
        }
    }

    private static showCopyResult(copyButton: HTMLElement, result: TextResources) {
        copyButton.textContent = result

        clearTimeout(copyResultTimers.get(copyButton))
        copyResultTimers.set(copyButton, setTimeout(() => copyButton.textContent = TextResources.copy, COPY_FEEDBACK_DURATION))
    }
}