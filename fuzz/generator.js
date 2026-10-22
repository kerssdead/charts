(function (root) {
function createGenerator(seed) {
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1))
    const pick = a => a[Math.floor(rnd() * a.length)]
    const chance = p => rnd() < p
    
    const LABELS = [i => `Item ${i}`, i => `Very long label number ${i} that goes on and on and on forever`, i => '', i => `😀👍🏽 эмодзи ${i}`, i => 'Same', i => `${i}`, i => `A`, i => `Line\nbreak ${i}`]
    function num(scale) {
        return pick([
            () => rnd() * scale,
            () => rnd() * scale - scale / 2,
            () => 0,
            () => -rnd() * scale,
            () => rnd() * 1e-6,
            () => rnd() * 1e12,
            () => scale,
            () => Math.round(rnd() * 10),
            () => 0.001 * rnd()
        ])()
    }
    function gen() {
        const scale = pick([1, 10, 1000, 1e6, 0.01, 1e9])
        const labelFn = pick(LABELS)
        const count = pick([0, 1, 1, 2, 3, 5, 8, 15, 30, 60])
        const valueMode = pick(['random', 'same', 'zero', 'mixed'])
        const v = () => valueMode === 'zero' ? 0 : valueMode === 'same' ? scale : num(scale)
        const color = () => chance(0.5) ? undefined : '#' + ri(0, 0xffffff).toString(16).padStart(6, '0')
        const type = ri(0, 3)
        const data = {}
        switch (type) {
            case 0: {
                const xType = ri(0, 2)
                const points = pick([0, 1, 2, 5, 12, 40, 150])
                const plotType = pick([0, 0, 1, 2, 3, 4])
                const mixed = chance(0.3)
                data.values = Array.from({ length: count }, (_, i) => ({
                    type: mixed ? ri(0, 4) : plotType,
                    label: labelFn(i),
                    width: pick([undefined, 0, 1, 3, 10, 50]),
                    dash: pick([undefined, [], [5, 5], [1, 3]]),
                    color: color(),
                    data: { Id: i, Name: 'n' + i, Value: i },
                    values: Array.from({ length: chance(0.2) ? ri(0, points) : points }, (_, j) => ({
                        x: xType === 1 ? new Date(Date.UTC(2025, 0, 1) + j * pick([86400000, 3600000, 2592000000])).toISOString()
                            : xType === 2 ? pick([`Cat ${j}`, `Long category name ${j} here`, `${j}`]) : (chance(0.1) ? j * scale : j),
                        y: v(),
                        data: { Id: j, Name: 'p' + j, Value: j }
                    }))
                }))
                Object.assign(data, { xType, xTitle: chance(0.4) ? 'X axis title' : null, yTitle: chance(0.4) ? 'Y axis title' : null,
                    simple: chance(0.15), shortLabels: chance(0.3), yMax: chance(0.15) ? pick([0, 10, scale, -5]) : undefined })
                break
            }
            case 1:
                data.values = Array.from({ length: count }, (_, i) => ({ value: Math.abs(v()), label: labelFn(i), color: color(), data: { Id: i, Name: 's' + i, Value: i } }))
                Object.assign(data, { innerRadius: pick([0, 0, 30, 50, 80, 100, 120, -10]), innerTitle: pick(['', 'Total', 'A very long inner title text here']), labelPercent: chance(0.3) })
                break
            case 2: {
                const min = pick([0, 0, -100, 10, scale])
                const max = pick([100, scale, min, min - 10, 1000])
                data.values = Array.from({ length: Math.min(count, pick([1, 1, 2, count])) }, (_, i) => ({ value: pick([v(), min, max, max * 2, min - 50]), label: labelFn(i), color: color() }))
                Object.assign(data, { min, max, innerRadius: pick([0, 50, 80, 100, -10]), enableTrack: chance(0.5) })
                break
            }
            case 3:
                data.values = Array.from({ length: count }, (_, i) => ({
                    label: labelFn(i), color: color(), value: chance(0.3) ? Math.abs(v()) : undefined,
                    data: { Id: i, Name: 'g' + i, Value: i },
                    sectors: chance(0.2) ? undefined : Array.from({ length: pick([0, 1, 3, 10]) }, (_, j) => ({ value: Math.abs(v()), label: labelFn(j), data: { Id: j, Name: 'c' + j, Value: j } }))
                }))
                Object.assign(data, { padding: pick([0, 2, 10, 40, -5]), gap: pick([0, 2, 10, 40, -5]) })
                break
        }
        const multi = chance(0.12)
        const settings = {
            type, data,
            title: chance(0.4) ? pick(['Title', 'An extremely long title that probably should be truncated somewhere along the way ok']) : null,
            enableTooltip: chance(0.7), enableLegend: chance(0.6), enableOther: chance(0.3), staticMode: chance(0.1),
            enableMove: chance(0.3), disableInteractions: chance(0.05), disableMenu: chance(0.1),
            baseColor: chance(0.2) ? pick(['#ff0000', '#000000', '#ffffff', '#3366cc']) : null,
            templateId: chance(0.15) ? 'tpl' : null,
            valuePostfix: chance(0.2) ? pick(['%', ' kg', ' very long postfix']) : undefined,
            legendPlace: chance(0.5) ? ri(0, 3) : undefined,
            contextMenu: chance(0.2) ? [{ text: 'Button 1' }, { text: 'Button 2' }] : undefined,
            dark: chance(0.25)
        }
        if (multi) {
            settings.charts = Array.from({ length: ri(2, 5) }, (_, i) => ({ type: (type + i) % 4, title: `Chart ${i}`, data: gen().settings.data }))
            settings.columns = pick([undefined, 1, 2, 3])
        }
        const size = pick([[800, 500], [300, 200], [120, 80], [1400, 900], [50, 50], [600, 1000], [200, 600], [1, 1]])
        return { settings, size }
    }

    return { gen, rnd, ri, pick, chance, get seed() { return seed }, set seed(value) { seed = value } }
}

if (typeof module !== 'undefined') module.exports = createGenerator
else root.createGenerator = createGenerator
})(this)