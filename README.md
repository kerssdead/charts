# OCharts

TypeScript canvas charts: plot, pie, gauge, treemap, segmented bar and tree bar.

## Installation

### Script tag

Add the styles and the script via [jsDelivr](https://www.jsdelivr.com/). The script defines the global `OCharts`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kerssdead/charts@2.1.185/dist/main.css">
<script src="https://cdn.jsdelivr.net/gh/kerssdead/charts@2.1.185/dist/ocharts.js"></script>
```

### Bundler

The package ships an ES module with types. Load the styles `dist/main.css` separately.

```ts
import OCharts, { ChartType } from 'charts'
import 'charts/dist/main.css'

const chart = OCharts.chart(element, { type: ChartType.Pie, data: { values: [] } })
```

Supported browsers: Chrome and Edge 99+, Firefox 112+, Safari 16+.

## Usage

```html
<div id="chart" style="height: 320px"></div>

<script>
    const chart = OCharts.chart(document.getElementById('chart'), {
        type: 'pie',
        data: {
            values: [
                { label: 'North', value: 40 },
                { label: 'South', value: 25 },
                { label: 'East', value: 20 },
                { label: 'West', value: 15 }
            ]
        }
    })

    chart.render()
</script>
```

The chart fills its container. If the container has no height, a fallback height is used. Set `width` and `height` in the options to size it.

### Several charts in one container

Pass `charts` instead of `type` and `data`. A chart item has its own `type` (default `'plot'`), `title` and `data`. `columns` sets the number of columns in the grid.

```js
OCharts.chart(element, {
    title: 'Regional overview',
    enableLegend: true,
    columns: 2,
    charts: [
        { type: 'pie', title: 'Share', data: { values: [{ label: 'North', value: 40 }, { label: 'South', value: 25 }] } },
        { type: 'gauge', title: 'Target', data: { values: [{ label: 'Done', value: 72 }], min: 0, max: 100 } }
    ]
})
```

Use either `type` with `data`, or `charts`. TypeScript rejects mixing them.

## Chart types

| `type` | Chart |
|---|---|
| `'plot'` (default) | Line, column, bar and area series |
| `'pie'` | Pie and donut |
| `'gauge'` | Gauge |
| `'tree-map'` | Treemap |
| `'segmented-bar'` | Segmented bar |
| `'tree-bar'` | Expandable tree of bars |

In TypeScript you can also use the `ChartType` enum, for example `ChartType.Pie`.

### Example

```js
{
    type: 'plot',
    data: {
        xType: 'number',     // 'number' | 'date' | 'text'
        xScale: 'linear',    // 'category' | 'linear' | 'log'
        yScale: 'linear',
        xTitle: 'Month',
        yTitle: 'Revenue',
        values: [
            { type: 'line', label: 'North', width: 2, values: [{ x: 1, y: 12 }, { x: 2, y: 18 }] },
            { type: 'column', label: 'South', values: [{ x: 1, y: 10 }, { x: 2, y: 14 }] }
        ]
    }
}
```

Series `type`: `'line'` (default), `'attention-line'`, `'column'`, `'bar'`, `'stacking-column'`, `'area'`. A line series also takes `drawMode: 'straight' | 'smooth'`, `width` and `dash`.