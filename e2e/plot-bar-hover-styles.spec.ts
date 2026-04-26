/*
    #395 Test for correct PlotType.Bar mouse hover styles
    https://github.com/kerssdead/charts/issues/395
 */

import { test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType, PlotAxisType, PlotType } from '../src/static/Enums'
import Clip from './utils/Clip'

test('Hover styles should be rendered correct for bars in plot chart', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(2)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(90)
    await Settings.chartType(ChartType.Plot)
    await Settings.plotType(PlotType.Bar)
    await Settings.xAxisType(PlotAxisType.Text)

    await page.mouse.move(300, 100)
    await Utils.wait(300)

    await Utils.checkScreenshot(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUAB4DASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAgGB//EABsQAQAABwAAAAAAAAAAAAAAAAABBAYWVZHR/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAQFBv/EABkRAQACAwAAAAAAAAAAAAAAAAABAhMUUf/aAAwDAQACEQMRAD8A5MKMsuncTLaj0suncTLaj1j4ZcvqW6nMUZZdO4mW1HpZdO4mW1Hphk1LdaEBSvAAf//Z',
        new Clip(84, 127, 30, 20)
    )
})