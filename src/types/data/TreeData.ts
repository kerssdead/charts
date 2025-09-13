class TreeData implements Data {
    values: Value[]

    type: number

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