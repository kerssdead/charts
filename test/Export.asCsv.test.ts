import Export from '@/export/Export'
import ChartItem from '@/types/ChartItem'
import PlotData from '@/types/data/PlotData'
import { ChartType } from '@/static/Enums'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff' }))

const getCsv = async (charts: ChartItem[]) => {
    const saveAs = jest.spyOn(Export, 'saveAs').mockResolvedValue()

    Export.asCsv(charts, 'Table')

    const blob = saveAs.mock.calls[0][1]

    saveAs.mockRestore()

    return (await blob.text()).replace('﻿', '')
}

describe('Saving charts as CSV', () => {
    it('Should leave cells of missing values empty', async () => {
        const data = {
            values: [
                { label: 'A', values: [{ x: 1, y: 1 }, { x: 2, y: 2 }] },
                { label: 'B', values: [{ x: 1, y: null }] }
            ]
        } as PlotData

        expect(await getCsv([{ type: ChartType.Plot, data } as ChartItem]))
            .toBe('"","1","2"\n"A","1","2"\n"B","",""\n"","1","2"')
    })
})