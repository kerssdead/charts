function showChartTypeSettings(type, chartsCount) {
    const chartTypeOptions = document.getElementById('chart-type').options,
        visibleGroupIds = Array.from(
            { length: chartsCount },
            (_, i) => chartTypeOptions[(type + i) % chartTypeOptions.length].dataset.settingsId
        )

    for (const option of chartTypeOptions)
        document.getElementById(option.dataset.settingsId).hidden = !visibleGroupIds.includes(option.dataset.settingsId)
}

function createSettingRow(title, control) {
    const row = document.createElement('label')

    if (control.type === 'checkbox')
        row.append(control, title)
    else
        row.append(title, control)

    return row
}

function createInputSetting(type, id, title, attributes = {}) {
    const input = Object.assign(document.createElement('input'), { type, id, ...attributes })

    input.addEventListener(type === 'range' ? 'input' : 'change', refresh)

    return createSettingRow(title, input)
}

function createChartSizeSetting(id, title, attributes, onInput) {
    const input = Object.assign(document.createElement('input'), { type: 'range', id, ...attributes })

    input.addEventListener('input', onInput)

    return createSettingRow(title, input)
}

function createSelectSetting(id, title, options) {
    const select = Object.assign(document.createElement('select'), { id })

    for (const { text, value, settingsId } of options) {
        const option = new Option(text, value)

        if (settingsId)
            option.dataset.settingsId = settingsId

        select.append(option)
    }

    select.addEventListener('change', refresh)

    return createSettingRow(title, select)
}

function indexedOptions(...texts) {
    return texts.map((text, value) => ({ text, value }))
}

function buildSettingsGroups(groups) {
    const settings = document.querySelector('.settings')

    for (const { id, title, controls } of groups) {
        const group = Object.assign(document.createElement('div'), { id }),
            heading = Object.assign(document.createElement('h3'), { textContent: title })

        group.append(heading, ...controls)
        settings.append(group)
    }
}

buildSettingsGroups([
    {
        id: 'general-settings',
        title: 'General',
        controls: [
            createSelectSetting('chart-type', 'Chart Type', [
                { text: 'Plot', value: 0, settingsId: 'plot-settings' },
                { text: 'Circular', value: 1, settingsId: 'circular-settings' },
                { text: 'Gauge', value: 2, settingsId: 'gauge-settings' },
                { text: 'Tree Map', value: 3, settingsId: 'tree-settings' },
                { text: 'Segmented Bar', value: 4, settingsId: 'segmented-bar-settings' },
                { text: 'Tree Bar', value: 5, settingsId: 'tree-settings' }
            ]),
            createInputSetting('number', 'charts-count', 'Charts Count', { min: 1, value: 1 }),
            createInputSetting('number', 'columns', 'Columns', { min: 0 }),
            createSelectSetting('values-type', 'Values', indexedOptions('Random', 'Ascending', 'Same')),
            createInputSetting('number', 'values-count', 'Values Count', { min: 0, value: 1 }),
            createChartSizeSetting('width', 'Width', { value: 100 }, setWidth),
            createChartSizeSetting('height', 'Height', {}, setHeight),
            createInputSetting('checkbox', 'tooltip', 'Tooltip'),
            createInputSetting('checkbox', 'custom-tooltip', 'Custom Tooltip'),
            createInputSetting('checkbox', 'legend', 'Legend'),
            createInputSetting('checkbox', 'title', 'Title'),
            createInputSetting('checkbox', 'context-menu', 'Context Menu'),
            createInputSetting('checkbox', 'dark-theme', 'Dark Theme'),
            createInputSetting('checkbox', 'static-mode', 'Static mode'),
            createSelectSetting('color-mode', 'Colors', indexedOptions('Random', 'Palette', 'Base color')),
            createInputSetting('color', 'base-color', 'Base Color', { value: '#32a852' }),
            createInputSetting('text', 'custom-label', 'Custom Label'),
            createInputSetting('checkbox', 'indexed-custom-label', 'Indexed custom label'),
            createInputSetting('text', 'postfix', 'Postfix'),
            createInputSetting('number', 'base-value', 'Base Value', { value: 1000 }),
            createInputSetting('checkbox', 'debug-mode', 'Debug mode'),
            createInputSetting('checkbox', 'move', 'Move')
        ]
    },
    {
        id: 'plot-settings',
        title: 'Plot',
        controls: [
            createSelectSetting(
                'plot-type',
                'Plot Type',
                indexedOptions('Line', 'Attention Line', 'Column', 'Bar', 'Stacking Column', 'Area')
            ),
            createInputSetting('checkbox', 'x-axis-label', 'X-axis Label'),
            createInputSetting('checkbox', 'y-axis-label', 'Y-axis Label'),
            createInputSetting('number', 'points-count', 'Points count', { min: 0, value: 40 }),
            createInputSetting('number', 'series-width', 'Series Width', { value: 4 }),
            createInputSetting('checkbox', 'simple', 'Simple'),
            createSelectSetting('x-axis-type', 'X-axis type', [...indexedOptions('Number', 'Date', 'Text'), { text: 'undefined' }]),
            createSelectSetting('x-scale', 'X-axis scale', indexedOptions('Category', 'Linear', 'Log')),
            createSelectSetting('y-scale', 'Y-axis scale', [{ text: 'Linear', value: 1 }, { text: 'Log', value: 2 }]),
            createInputSetting('checkbox', 'negative-values-in-plot', 'Enable negative values in plot'),
            createSelectSetting('line-type', 'Line type', [
                { text: 'Solid', value: '[]' },
                { text: 'Dash', value: '[15,5]' },
                { text: 'Dotted', value: '[5,5]' }
            ]),
            createInputSetting('checkbox', 'smooth-line', 'Smooth line'),
            createInputSetting('checkbox', 'short-labels', 'Short Labels'),
            createInputSetting('number', 'y-max', 'Y-axis max', { min: 0 })
        ]
    },
    {
        id: 'circular-settings',
        title: 'Circular',
        controls: [
            createInputSetting('range', 'inner-radius', 'Inner Radius'),
            createInputSetting('checkbox', 'other', 'Other'),
            createInputSetting('text', 'inner-title', 'Inner Title')
        ]
    },
    {
        id: 'gauge-settings',
        title: 'Gauge',
        controls: [
            createInputSetting('number', 'gauge-min', 'Min', { value: 0 }),
            createInputSetting('number', 'gauge-max', 'Max', { value: 100 }),
            createInputSetting('checkbox', 'use-track', 'Use track', { checked: true }),
            createInputSetting('checkbox', 'disable-step-labels', 'Hide step labels')
        ]
    },
    {
        id: 'tree-settings',
        title: 'Tree Map / Tree Bar',
        controls: [
            createInputSetting('range', 'tree-padding', 'Padding'),
            createInputSetting('range', 'tree-gap', 'Gap', { min: 0, max: 20, value: 4 }),
            createInputSetting('number', 'tree-sectors-count', 'Sectors Count', { min: 0, value: 10 })
        ]
    },
    {
        id: 'segmented-bar-settings',
        title: 'Segmented Bar',
        controls: [
            createInputSetting('text', 'left-label', 'Left label', { value: '08/01/2009' }),
            createInputSetting('text', 'right-label', 'Right label', { value: '03/23/2013' }),
            createInputSetting('number', 'stops-count', 'Stops count', { min: 0, value: 2 }),
            createInputSetting('checkbox', 'percentage-mode', 'Percentage mode')
        ]
    }
])

function readSettingValues() {
    const values = {}

    for (const control of document.querySelectorAll('.settings input, .settings select'))
        values[control.id] = control.type === 'checkbox' ? control.checked : control.value

    return values
}