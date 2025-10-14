import { TableData } from 'types/TableData'
import { Helper } from 'Helper'
import { Value } from 'types/base/Value'
import { ChartSettings } from 'types/ChartSettings'
import { Formatter } from 'helpers/Formatter'
import { Styles } from 'static/constants/Styles'
import { Tag } from 'static/Enums'

export class Decomposition {
    static toTable(values: TableData) {
        let table = document.createElement(Tag.Table)

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
                <th>
                    ${ tableHeader.display }
                </th>
            `

        for (const [key, value] of valuesMap) {
            let columns = ''

            for (const [vKey, vValue] of value) {
                columns += `
                    <td>
                        ${ vValue == undefined ? '' : Formatter.number(vValue) }
                    </td>
                `

                if (totals.has(vKey)) {
                    let totalValue = +(totals.get(vKey) ?? 0)
                    totals.set(vKey, totalValue + +vValue)
                } else {
                    totals.set(vKey, vValue)
                }
            }

            rows += `
                <tr>
                    <td class="o-table-label">
                        ${ key.trim() }
                    </td>
                    
                    ${ columns } 
                </tr>
            `
        }

        let totalColumns = ''

        for (const [, value] of totals)
            totalColumns += `
                <td>
                    ${ value == undefined ? '' : Formatter.number(value) }
                </td>
            `

        table.innerHTML = `
            <thead>
                <tr>
                    <th></th>
                
                    ${ headers }
                </tr>
            </thead>
        
            <tbody>
                ${ rows }
            </tbody>
            
            <tfoot>
                <tr>
                    <td></td>
                
                    ${ totalColumns }
                </tr>
            </tfoot>
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