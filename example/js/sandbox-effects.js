const toolbar = document.querySelector('.toolbar')

new ResizeObserver(() => {
    document.documentElement.style.setProperty('--sandbox-toolbar-height', toolbar.offsetHeight + 'px')
    updateSettingsFade()
}).observe(toolbar)

const settingsColumn = document.querySelector('.settings'),
    settingsFadeHeight = parseFloat(getComputedStyle(settingsColumn).getPropertyValue('--sandbox-settings-fade-height'))

function updateSettingsFade() {
    const hiddenAbove = settingsColumn.scrollTop,
        hiddenBelow = settingsColumn.scrollHeight - settingsColumn.clientHeight - hiddenAbove

    settingsColumn.style.setProperty('--sandbox-fade-top', Math.min(hiddenAbove / settingsFadeHeight, 1))
    settingsColumn.style.setProperty('--sandbox-fade-bottom', Math.min(Math.max(hiddenBelow / settingsFadeHeight, 0), 1))
}

settingsColumn.addEventListener('scroll', updateSettingsFade)
window.addEventListener('resize', updateSettingsFade)

document.addEventListener('pointermove', event => {
    const control = event.target.closest('button, input, select') ?? event.target.closest('label')?.control

    if (!control)
        return

    const bounds = control.getBoundingClientRect()

    control.style.setProperty('--sandbox-hover-x', event.clientX - bounds.left + 'px')
    control.style.setProperty('--sandbox-hover-y', event.clientY - bounds.top + 'px')
})

window.addEventListener('load', () => {
    const appearingSections = document.querySelectorAll('.toolbar, .chart-container, .examples, .settings > :not([hidden])')

    appearingSections.forEach((section, order) => section.style.setProperty('--sandbox-appear-order', order))

    for (const section of document.querySelectorAll('.examples, .settings > *'))
        section.querySelectorAll(':scope > button, :scope > label').forEach((row, order) => row.style.setProperty('--sandbox-row-order', order))

    document.documentElement.classList.add('loaded')
})