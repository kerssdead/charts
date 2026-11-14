const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')

function isDarkTheme() {
    return document.getElementById('dark-theme').checked || systemDarkTheme.matches
}

function applyPageTheme() {
    document.documentElement.classList.toggle('dark', isDarkTheme())
}

systemDarkTheme.addEventListener('change', applyPageTheme)