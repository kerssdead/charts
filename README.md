# OCharts

Typescript Canvas Charts.

## Installation

Add the styles and the script to your page via [jsDelivr](https://www.jsdelivr.com/):

**CSS:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kerssdead/charts@2.1.99/dist/main.css">
```

**JavaScript:**

```html
<script src="https://cdn.jsdelivr.net/gh/kerssdead/charts@2.1.99/dist/ocharts.js"></script>
```

## Usage

```html
<div id="chart"></div>

<script>
    OCharts.chart(document.getElementById('chart'), {
        type: 1, // Pie
        data: {
            values: [
                { label: 'North', value: 40 },
                { label: 'South', value: 25 },
                { label: 'East', value: 20 },
                { label: 'West', value: 15 }
            ]
        }
    })
</script>
```

Chart types:

- `0` — Plot
- `1` — Pie
- `2` — Gauge
- `3` — TreeMap
- `4` — SegmentedBar
- `5` — TreeBar