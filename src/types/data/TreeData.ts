import Value from 'types/base/Value'
import TableValue from 'types/TableValue'
import TableData from 'types/TableData'
import Data from 'types/interfaces/Data'

class TreeData implements Data {
    values: Value[]

    padding: number

    static getRows(data: TreeData): TableData {
        const key = 'Value'

        let values: TableValue[] = []

        for (const value of data.values)
            values.push({
                name: value.label,
                values: new Map([[key, value.value]])
            })

        return {
            headers: [
                {
                    value: key,
                    display: key
                }
            ],
            values: values
        }
    }
}

export default TreeData