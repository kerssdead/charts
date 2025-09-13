class Decomposition {
    static toTable(values: TableData) {
        let table = document.createElement(Tag.Table)

        table.classList.add('o-table')

        let totals = new Map<string, number>()
        let rows = '',
            headers = ''

        let valuesMap = new Map<string, Map<string, any>>()

        for (const tableValue of values.values) {
            let allColumns = new Map<string, any>()

            for (const header of values.headers)
                allColumns.set(header.value, 0)

            for (const [key, value] of tableValue.values)
                allColumns.set(key, value)

            valuesMap.set(tableValue.name, allColumns)
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
                        ${ vValue == undefined ? '' : vValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                    </td>
                `

                if (totals.has(vKey)) {
                    let totalValue = totals.get(vKey)
                    totals.set(vKey, (totalValue ?? 0) + +vValue)
                } else {
                    totals.set(vKey, vValue)
                }
            }

            rows += `
                <tr>
                    <td class="o-table-label">
                        ${ key }
                    </td>
                    
                    ${ columns } 
                </tr>
            `
        }

        let totalColumns = ''

        for (const [, value] of totals) {
            totalColumns += `
                <td>
                    ${ value == undefined ? '' : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                </td>
            `
        }

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
}