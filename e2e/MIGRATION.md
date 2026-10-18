# E2E migration: hash of canvas draw calls instead of base64 screenshots

## Answer

I read "cache" as the short **hash** that replaces the base64 string. That's what this does.

### Why not pixels, even with text removed

I had a research agent check whether Chromium draws non-text shapes to identical pixels on different OSes. Short version: **not reliably**.

- **Different CPUs give different pixels.** A Playwright maintainer [confirmed](https://github.com/microsoft/playwright/issues/13873) that arm and intel Docker images "produce different screenshots". Skia (the 2D graphics library Chrome uses) has different code paths for the two CPU types.
- **The difference is usually ±1 per channel**, on anti-aliased edges, semi-transparent pixels and gradients. Your Mac is arm64 and GitHub Actions runners are x64, so an exact pixel hash would break between them.
- **Snapping colors to coarser steps doesn't help.** A value that's off by 1 can still land in a different step.
- **Docker doesn't fully solve it.** An arm64 Mac running the arm64 image still differs from x64 CI. Running the x64 image under Rosetta has its own [bug](https://github.com/docker/desktop-feedback/issues/686) (fully white Chromium screenshots).
- **Text is the biggest source of difference.** Each OS turns glyph outlines into pixels with its own engine (FreeType, Core Text, DirectWrite). Using the same web font doesn't change that.
- **No launch flag guarantees identical pixels across platforms.** `--deterministic-mode` only controls frame timing.

**Conclusion:** checking glyph pixels or anti-aliasing **cannot** be OS-independent. If you need it, it has to run on one pinned environment: the same OS, the same CPU architecture and the same Chromium version.

### What I did instead: hash the draw calls

The canvas output is fully determined by the calls the library makes to it. So for the last frame, the test records each call that draws something:

- **Calls:** `fill`, `stroke`, `clip`, `fillRect`, `strokeRect`, `clearRect`, `fillText`, `strokeText`.
- **The path behind it:** `moveTo`, `lineTo`, `arc`, `roundRect` and so on.
- **The full context state at that moment:** every settable property (`fillStyle` including gradients and their color stops, `strokeStyle`, `lineWidth`, `font`, `globalAlpha`, `textAlign`, shadows, filter…), plus the line dash and the transform.

That gives you OS-independent checks of:

- shapes, rounded-corner radii, dashes, gradients, colors and alpha;
- layer order;
- text strings, their positions, font, alignment and color;
- `render()` bugs, not just layout.

It does **not** check how Chromium turns those calls into pixels: glyph shapes and anti-aliasing. Those are the browser's job, and they're exactly the part that differs per OS and CPU.

The rest of the design:

- **Layout:** `measureText` returns fixed Arial widths from a table of numbers, not a font file, so layout is the same on every OS. The widths are Arial's own, so layout should stay where it is on your Mac today, and the existing `Clip` areas and mouse coordinates should stay valid.
- **`Clip`:** each recorded call carries the bounding box of its shape or text, and only calls that touch the clip area are hashed. Spec code doesn't change apart from the literal.
- **Text is still drawn normally.** Playwright's screenshot on failure shows the real chart.
- **Waiting for animations:** `drawCalls()` reads the draw calls every 100ms until two reads in a row are equal.
- **Hash:** the first 8 hex characters of the SHA-1 of the draw-call JSON. No stored files.

### If you really need glyph or anti-aliasing checks

Keep one or two pixel-screenshot tests and run them only in CI (Linux x64). Generate their expected values from the CI run, not on your Mac. Everything else uses the draw-call hash.

### Code changes, kept as small as I could

| File | Change |
|---|---|
| `e2e/utils/Render.ts` (replaces `Screenshot.ts`) | `intercept()` patches the canvas before the page loads, `drawCalls()` returns the draw calls inside the clip as JSON (one per line), `hash()` shortens them, `image()` takes the clip picture for a mismatch. |
| `e2e/utils/Utils.ts` | `goto()` opens the repo's own `index.html` on any machine. `setup()` calls `Render.intercept(page)`. `checkScreenshot` is renamed to `checkRender`, which prints the JSON and attaches `clip.png` on a mismatch. |
| `playwright.config.ts` | Removed `baseURL`. Added `locale: 'en-US'`, `timezoneId: 'UTC'` and `colorScheme: 'light'`, because labels use `Intl` and `toLocaleDateString` and the theme follows the system. |
| `src/` | No changes. The `Renderer` hook from earlier is removed. |

### Current state

- I didn't run the e2e tests (you asked me not to unless requested), so the recorder hasn't been tried in a real browser yet.
- **Every `checkRender` spec fails until its hash is filled in**, because the specs still hold base64 strings.
- `tsc` passes for the e2e project.
- `e2e/README.md` describes the old queue approach and can be deleted.

## CI change, not applied

`.github/workflows/playwright.yml`. `npx webpack` builds `dist` from the PR's sources without the version bump that `npm run build` does.

```yaml
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: lts/*
  - run: npm ci
  - run: npx webpack
  - run: npx playwright install --with-deps chromium
  - run: npx playwright test
```

## Getting a hash

1. Put `'________'` in the spec, as shown in the blocks below.
2. Run `npx playwright test <spec name>`.
3. It fails with `Expected: "________"  Received: "3f9a0c1b"`, and prints `Draw calls (3f9a0c1b):` with one draw call per line. It also attaches `clip.png`, an image of the clip area, to the test result: the reporter prints its path under `test-results/`, which is gitignored. The full-page screenshot is attached as well (`screenshot: 'only-on-failure'`). To see what changed after a refactor, save that output from before and after the change and diff the two.
4. Open the failure screenshot in the report (`npx playwright show-report`) to check the chart looks right. Then paste `3f9a0c1b` into the spec.

Run every spec twice before trusting its hash. If the two runs differ, something in that spec isn't deterministic (timing, hover).

## Tests

Each block shows only the code that changes in that spec. Everything else, including `Clip` and mouse coordinates, stays as it is.

### `circular-default-label-position.spec.ts`

Pie chart tooltip should not be in default position when mouse leave canvas ([issue](https://github.com/kerssdead/charts/issues/441))

```ts
await Utils.checkRender(
    '________',
    new Clip(10, 10, 200, 100)
)
```

### `circular-donut-normal-render.spec.ts`

Circular donut chart should be rendered without any issues

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-donut-single-sector.spec.ts`

Donut chart with single sector should be rendered with inner radius ([issue](https://github.com/kerssdead/charts/issues/412))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-hide-sectors-via-legend.spec.ts`

Pie chart sectors should not be rendered after disabled in legend ([issue](https://github.com/kerssdead/charts/issues/433))

```ts
await Utils.checkRender(
    '________',
    new Clip(173, 34, 582, 582)
)
```

### `circular-hover-sector-overlap-label.spec.ts`

Hover sector in circular chart should not overlap other labels ([issue](https://github.com/kerssdead/charts/issues/369))

```ts
await Utils.checkRender(
    '________',
    new Clip(330, 620, 100, 100)
)
```

### `circular-label-overflow.spec.ts`

Label should not be rendered ([issue](https://github.com/kerssdead/charts/issues/363))

```ts
await Utils.checkRender(
    '________',
    new Clip(350, 0, 90, 12)
)
```

### `circular-legend-max-height.spec.ts`

Legend should not be bigger than chart canvas ([issue](https://github.com/kerssdead/charts/issues/439))

No changes: this spec doesn't call `checkRender`.

### `circular-negative-radius.spec.ts`

Circular chart should not be rendered without any exceptions in console ([issue](https://github.com/kerssdead/charts/issues/382))

No changes: this spec doesn't call `checkRender`.

### `circular-pie-normal-render.spec.ts`

Circular pie chart should be rendered without any issues ([issue](https://github.com/kerssdead/charts/issues/380))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-pie-single-sector.spec.ts`

Circular pie chart should be rendered without any issues ([issue](https://github.com/kerssdead/charts/issues/406))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-pin-sector-after-click-outside.spec.ts`

Pie chart sector should not be pinned when mouse click not on sector and then mouse moved to sector ([issue](https://github.com/kerssdead/charts/issues/442))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-render-chart-menu.spec.ts`

Chart menu for circular chart type should be rendered correct ([issue](https://github.com/kerssdead/charts/issues/454))

```ts
await Utils.checkRender(
    '________',
    new Clip(787, 29, 138, 84)
)
```

### `circular-resize-height.spec.ts`

Circular height should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(299, 270, 330, 180)
)
```

### `circular-resize-width.spec.ts`

Circular width should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(234, 130, 460, 460)
)
```

### `circular-sector-context-tooltip-render-at-the-same-time.spec.ts`

Pie chart sector tooltip and context menu should not render at the same time ([issue](https://github.com/kerssdead/charts/issues/434))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-sector-highlight-via-legend.spec.ts`

Pie chart sector should be highlighted from legend ([issue](https://github.com/kerssdead/charts/issues/435))

```ts
await Utils.checkRender(
    '________'
)
```

### `circular-sector-reset-highlight-after-disable.spec.ts`

Pie chart sectors should not has another item over states ([issue](https://github.com/kerssdead/charts/issues/447))

```ts
await Utils.checkRender(
    '________'
)
```

### `decomposition-values-count.spec.ts`

Values with same names should decomposed to separate rows ([issue](https://github.com/kerssdead/charts/issues/343))

No changes: this spec doesn't call `checkRender`.

### `gauge-label-format.spec.ts`

Gauge labels should be formatted ([issue](https://github.com/kerssdead/charts/issues/327))

```ts
await Utils.checkRender(
    '________',
    new Clip(71, 659, 36, 20)
)
```

### `gauge-labels-shrink.spec.ts`

Gauge labels should not be shrunk when width is half of 100% ([issue](https://github.com/kerssdead/charts/issues/423))

```ts
await Utils.checkRender(
    '________',
    new Clip(180, 420, 568, 300)
)
```

### `gauge-legend.spec.ts`

Gauge should not has legend ([issue](https://github.com/kerssdead/charts/issues/293))

No changes: this spec doesn't call `checkRender`.

### `gauge-negative-radius.spec.ts`

Gauge should prevent crash when radius is negative ([issue](https://github.com/kerssdead/charts/issues/437))

No changes: this spec doesn't call `checkRender`.

### `gauge-resize-height.spec.ts`

Gauge height should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 110, 928, 500)
)
```

### `gauge-resize-width.spec.ts`

Gauge width should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(164, 0, 600, 720)
)
```

### `gauge-title-overlap.spec.ts`

Gauge labels should not overlap chart title ([issue](https://github.com/kerssdead/charts/issues/432))

```ts
await Utils.checkRender(
    '________',
    new Clip(440, 148, 48, 29)
)
```

### `plot-bar-hover-styles.spec.ts`

Hover styles should be rendered correct for bars in plot chart ([issue](https://github.com/kerssdead/charts/issues/395))

```ts
await Utils.checkRender(
    '________',
    new Clip(84, 127, 30, 20)
)
```

### `plot-bar-label-overlap-each-other.spec.ts`

Label should not overlap each other ([issue](https://github.com/kerssdead/charts/issues/367))

```ts
await Utils.checkRender(
    '________',
    new Clip(24, 680, 384, 20)
)
```

### `plot-bar-negative-values.spec.ts`

Bars on plot should render negative values ([issue](https://github.com/kerssdead/charts/issues/422))

```ts
await Utils.checkRender(
    '________',
    new Clip(34, 457, 880, 244)
)
```

### `plot-bar-width.spec.ts`

Bars on plot should has same heights ([issue](https://github.com/kerssdead/charts/issues/323))

```ts
await Utils.checkRender(
    '________',
    new Clip(80, 240, 40, 220)
)
```

### `plot-bar-x-axis-labels-normal-render.spec.ts`

Plot chart with bars x-axis should be rendered without any issues

```ts
await Utils.checkRender(
    '________',
    new Clip(62, 679, 858, 20)
)
```

### `plot-bar-y-axis-labels-normal-render.spec.ts`

Plot chart with bars y-axis should be rendered without any issues

```ts
await Utils.checkRender(
    '________',
    new Clip(38, 126, 37, 446)
)
```

### `plot-big-value-left-padding-shift.spec.ts`

Big numbers should not overlap y-axis title and should be in canvas ([issue](https://github.com/kerssdead/charts/issues/426))

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 0, 140, 720)
)
```

### `plot-columns-negative-values-only.spec.ts`

Only negative values in column plot chart should be render correctly ([issue](https://github.com/kerssdead/charts/issues/429))

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 0, 928, 406)
)
```

### `plot-columns-negative-values.spec.ts`

Negative values in column plot chart should have negative value ([issue](https://github.com/kerssdead/charts/issues/428))

```ts
await Utils.checkRender(
    '________'
)
```

### `plot-dark-theme.spec.ts`

Dark theme should work in plot chart ([issue](https://github.com/kerssdead/charts/issues/438))

```ts
await Utils.checkRender(
    '________',
    new Clip(40, 80, 100, 20)
)
```

### `plot-line-dashed-normal-render.spec.ts`

Plot chart with dashed lines should be rendered without any issues

```ts
await Utils.checkRender(
    '________',
    new Clip(212, 165, 565, 260)
)
```

### `plot-line-dotted-normal-render.spec.ts`

Plot chart with dotted lines should be rendered without any issues

```ts
await Utils.checkRender(
    '________',
    new Clip(212, 165, 565, 260)
)
```

### `plot-line-render-outside.spec.ts`

Plot chart should not renders outside plot ([issue](https://github.com/kerssdead/charts/issues/458))

```ts
await Utils.checkRender(
    '________',
    new Clip(883, 261, 10, 210)
)
```

### `plot-line-solid-normal-render.spec.ts`

Plot chart with solid lines should be rendered without any issues

```ts
await Utils.checkRender(
    '________',
    new Clip(212, 165, 565, 260)
)
```

### `plot-negative-zero-on-y-axis.spec.ts`

Zero y-axis label shouldn`t be negative ([issue](https://github.com/kerssdead/charts/issues/347))

```ts
await Utils.checkRender(
    '________',
    new Clip(37, 338, 39, 23)
)
```

### `plot-resize-height.spec.ts`

Plot height should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 260, 928, 200)
)
```

### `plot-resize-width.spec.ts`

Plot width should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(239, 0, 450, 720)
)
```

### `plot-simple-column-base-offset.spec.ts`

Simple plot offsets should be minimal ([issue](https://github.com/kerssdead/charts/issues/358))

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 688, 32, 32)
)

await Utils.checkRender(
    '________',
    new Clip(896, 688, 32, 32)
)
```

### `plot-text-tooltip-number-format.spec.ts`

When x-axis type is text tooltip value for y-axis should be formatted as number ([issue](https://github.com/kerssdead/charts/issues/402))

```ts
await Utils.checkRender(
    '________',
    new Clip(344, 313, 151, 58)
)
```

### `plot-title.spec.ts`

Plot title should be rendered ([issue](https://github.com/kerssdead/charts/issues/322))

```ts
await Utils.checkRender(
    '________',
    new Clip(440, 10, 48, 30)
)
```

### `plot-x-axis-type-undefined.spec.ts`

Plot with undefined x-axis type should render default label instead of empty ([issue](https://github.com/kerssdead/charts/issues/383))

```ts
await Utils.checkRender(
    '________',
    new Clip(88, 624, 812, 48)
)
```

### `plot-x-type-date.spec.ts`

Plot with x-axis types is date first date shouldn`t be "Invalid Date" ([issue](https://github.com/kerssdead/charts/issues/342))

```ts
await Utils.checkRender(
    '________',
    new Clip(61, 634, 80, 22)
)
```

### `tooltip-overflow.spec.ts`

Regular tooltip should not overflow canvas ([issue](https://github.com/kerssdead/charts/issues/364))

```ts
await Utils.checkRender(
    '________',
    new Clip(579, 688, 150, 32)
)
```

### `treemap-empty.spec.ts`

Tree Map without data should render empty placeholder ([issue](https://github.com/kerssdead/charts/issues/345))

```ts
await Utils.checkRender(
    '________'
)
```

### `treemap-label-overflow.spec.ts`

Tree Map label with spaces should not overflow cell ([issue](https://github.com/kerssdead/charts/issues/361))

```ts
await Utils.checkRender(
    '________',
    new Clip(678, 181, 212, 30)
)
```

### `treemap-legend.spec.ts`

Tree Map should not has legend ([issue](https://github.com/kerssdead/charts/issues/305))

No changes: this spec doesn't call `checkRender`.

### `treemap-resize-height.spec.ts`

Tree Map height should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(0, 296, 928, 128)
)
```

### `treemap-resize-width.spec.ts`

Tree Map width should be resized

```ts
await Utils.checkRender(
    '________',
    new Clip(238, 0, 452, 720)
)
```