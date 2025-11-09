import PlotData from '../src/types/data/PlotData'

describe('Getting plot rows for decomposition', () => {
    it('Should has 3 rows', () => {
        const data = {
            values: [
                {
                    values: [
                        {
                            x: 1,
                            y: 1
                        },
                        {
                            x: 2,
                            y: 1
                        },
                        {
                            x: 3,
                            y: 2
                        }
                    ],
                    label: 'Series 1'
                },
                {
                    values: [
                        {
                            x: 1,
                            y: 2
                        },
                        {
                            x: 2,
                            y: 1
                        },
                        {
                            x: 3,
                            y: 3
                        }
                    ],
                    label: 'Series 2'
                },
                {
                    values: [
                        {
                            x: 1,
                            y: 3
                        },
                        {
                            x: 2,
                            y: 3
                        },
                        {
                            x: 3,
                            y: 1
                        }
                    ],
                    label: 'Series 3'
                }
            ]
        } as PlotData

        expect(PlotData.getRows(data).values.length)
            .toBe(3)
    })

    it('Should has 6 table headers', () => {
        const data = {
            values: [
                {
                    values: [
                        {
                            x: 1,
                            y: 1
                        },
                        {
                            x: 2,
                            y: 1
                        },
                        {
                            x: 3,
                            y: 2
                        }
                    ],
                    label: 'Series 1'
                },
                {
                    values: [
                        {
                            x: 10,
                            y: 5
                        },
                        {
                            x: 20,
                            y: 3
                        },
                        {
                            x: 30,
                            y: 7
                        }
                    ],
                    label: 'Series 2'
                }
            ]
        } as PlotData

        expect(PlotData.getRows(data).headers.length)
            .toBe(6)
    })

    it('Should has 6 date table headers', () => {
        function getDate(days: number) {
            let result = new Date(Date.now())
            result.setDate(result.getDate() + days)
            return result.toISOString()
        }

        const data = {
            xType: 1,
            values: [
                {
                    values: [
                        {
                            x: getDate(0),
                            y: 1
                        },
                        {
                            x: getDate(1),
                            y: 1
                        },
                        {
                            x: getDate(2),
                            y: 2
                        }
                    ],
                    label: 'Series 1'
                },
                {
                    values: [
                        {
                            x: getDate(6),
                            y: 5
                        },
                        {
                            x: getDate(7),
                            y: 3
                        },
                        {
                            x: getDate(8),
                            y: 7
                        }
                    ],
                    label: 'Series 2'
                }
            ]
        } as PlotData

        expect(PlotData.getRows(data).headers.length)
            .toBe(6)
    })
})