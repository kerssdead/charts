import TableData from 'types/TableData'
import * as Helper from 'Helper'
import Value from 'types/base/Value'
import ChartSettings from 'types/ChartSettings'
import Formatter from 'helpers/Formatter'
import Styles from 'static/constants/Styles'
import { Tag } from 'static/Enums'

class Decomposition {
    static toTable(values: TableData) {
        let table = document.createElement(Tag.Div)

        table.classList.add('o-table')

        let totals = new Map<string, number>()
        let rows = '',
            headers = '',
            index = 0

        let valuesMap = new Map<string, Map<string, any>>()

        for (const tableValue of values.values) {
            let allColumns = new Map<string, any>()

            for (const header of values.headers)
                allColumns.set(header.value, 0)

            for (const [key, value] of tableValue.values)
                allColumns.set(key, value)

            let indexSpaces = ''
            for (let i = 0; i < index; i++)
                indexSpaces += ' '

            valuesMap.set(tableValue.name + indexSpaces, allColumns)

            index++
        }

        for (const tableHeader of values.headers)
            headers += `
                <div>
                    ${ tableHeader.display }
                </div>
            `

        for (const [key, value] of valuesMap) {
            let columns = ''

            for (const [vKey, vValue] of value) {
                columns += `
                    <div>
                        ${ vValue == undefined ? '' : Formatter.number(vValue) }
                    </div>
                `

                if (totals.has(vKey)) {
                    let totalValue = +(totals.get(vKey) ?? 0)
                    totals.set(vKey, totalValue + +vValue)
                } else {
                    totals.set(vKey, vValue)
                }
            }

            rows += `
                <div class="o-table-row">
                    <div>
                        ${ key.trim() }
                    </div>
                    
                    ${ columns } 
                </div>
            `
        }

        let totalColumns = ''

        for (const [, value] of totals)
            totalColumns += `
                <div>
                    ${ value == undefined ? '' : Formatter.number(value) }
                </div>
            `

        table.innerHTML = `
            <div class="o-table-header">
                <div></div>

                ${ headers }
            </div>
        
            <div class="o-table-body">
                ${ rows }
            </div>
            
            <div class="o-table-footer">
                <div></div>

                ${ totalColumns }
            </div>
        `

        return table
    }

    static toChart<T extends Value>(settings: ChartSettings, values: T[]) {
        let container = document.createElement(Tag.Div),
            div = document.createElement(Tag.Div),
            script = document.createElement(Tag.Script),
            id = Helper.guid()

        container.style.display = Styles.Display.Flex
        container.style.height = '100%'

        div.id = id
        div.style.flexGrow = '1'

        let cloneSettings = JSON.parse(JSON.stringify(settings)) as ChartSettings

        if (cloneSettings.title)
            cloneSettings.title = cloneSettings.title + ' (Other)'
        cloneSettings.data.values = values
        cloneSettings.minWidth = undefined
        cloneSettings.minHeight = undefined

        script.innerHTML = `
            new OCharts.chart(document.getElementById('${ id }'), ${ JSON.stringify(cloneSettings) })
                .render()
        `

        container.append(div, script)

        return container
    }
}

export default Decomposition