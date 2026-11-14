const defaultSettingValues = readSettingValues()

delete defaultSettingValues.width
delete defaultSettingValues.height

function applyExample(exampleSettings) {
    for (const [id, value] of Object.entries({ ...defaultSettingValues, ...exampleSettings })) {
        const control = document.getElementById(id)

        if (control.type === 'checkbox')
            control.checked = value
        else
            control.value = value
    }

    refresh()
}

function buildExampleCards(examples) {
    const container = document.querySelector('.examples')

    return examples.map(({ title, description, settings }) => {
        const card = document.createElement('button'),
            heading = Object.assign(document.createElement('b'), { textContent: title }),
            text = Object.assign(document.createElement('span'), { textContent: description })

        card.append(heading, text)
        card.addEventListener('click', () => applyExample(settings))
        container.append(card)

        return { card, settings }
    })
}

function isExampleApplied(exampleSettings, currentValues) {
    return Object.entries({ ...defaultSettingValues, ...exampleSettings })
        .every(([id, value]) => String(currentValues[id]) === String(value))
}

function highlightAppliedExamples() {
    const currentValues = readSettingValues()

    for (const { card, settings } of exampleCards)
        card.ariaPressed = String(isExampleApplied(settings, currentValues))
}

const exampleCards = buildExampleCards([
    {
        title: 'Line',
        description: 'Three series with legend and tooltip',
        settings: { 'chart-type': 0, 'plot-type': 0, 'values-count': 3, legend: true, tooltip: true }
    },
    {
        title: 'Smooth area',
        description: 'Two smooth area series',
        settings: { 'chart-type': 0, 'plot-type': 5, 'values-count': 2, 'smooth-line': true, tooltip: true }
    },
    {
        title: 'Stacked columns',
        description: 'Four stacked series by month',
        settings: { 'chart-type': 0, 'plot-type': 4, 'values-count': 4, 'points-count': 12, 'series-width': 60, legend: true }
    },
    {
        title: 'Negative bars',
        description: 'Bars around zero with text axis',
        settings: {
            'chart-type': 0,
            'plot-type': 3,
            'values-count': 2,
            'points-count': 6,
            'series-width': 80,
            'x-axis-type': 2,
            'negative-values-in-plot': true
        }
    },
    {
        title: 'Donut',
        description: 'Six sectors with inner radius',
        settings: { 'chart-type': 1, 'values-count': 6, 'inner-radius': 60, legend: true, tooltip: true }
    },
    {
        title: 'Gauge',
        description: 'Single value on a track',
        settings: { 'chart-type': 2, title: true }
    },
    {
        title: 'Tree map',
        description: 'Twelve sectors with legend',
        settings: { 'chart-type': 3, 'tree-sectors-count': 12, legend: true, tooltip: true }
    },
    {
        title: 'Dashboard',
        description: 'Six mixed charts in three columns',
        settings: { 'charts-count': 6, columns: 3, title: true }
    }
])