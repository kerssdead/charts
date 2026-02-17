import { Page } from '@playwright/test'
import Selectors from './Selectors'
import { ChartType, PlotAxisType, PlotType } from '../../src/static/Enums'

class Settings {
    private static page: Page

    static initialize(page: Page) {
        Settings.page = page
    }

    private static fill(selector: string, value: any) {
        return Settings.page.locator(selector).fill(value.toString())
    }

    private static option(selector: string, option: any) {
        return Settings.page.locator(selector).selectOption(option?.toString() ?? 'undefined')
    }

    private static check(selector: string, enabled: boolean) {
        return Settings.page.locator(selector).setChecked(enabled)
    }

    static seed(value: number) {
        return Settings.fill(Selectors.seed, value)
    }

    static valuesCount(value: number) {
        return Settings.fill(Selectors.valuesCount, value)
    }

    static chartType(type: ChartType) {
        return Settings.option(Selectors.chartType, type)
    }

    static enableInitAnimation(value: boolean = true) {
        return Settings.check(Selectors.initAnimation, !value)
    }

    static innerRadius(value: number) {
        return Settings.fill(Selectors.innerRadius, value)
    }

    static customLabel(label: string) {
        return Settings.fill(Selectors.customLabel, label)
    }

    static gaugeMax(value: number) {
        return Settings.fill(Selectors.gaugeMax, value)
    }

    static enableLegend(value: boolean = true) {
        return Settings.check(Selectors.legend, value)
    }

    static plotType(type: PlotType) {
        return Settings.option(Selectors.plotType, type)
    }

    static xAxisType(type?: PlotAxisType) {
        return Settings.option(Selectors.xAxisType, type)
    }

    static pointsCount(value: number) {
        return Settings.fill(Selectors.pointsCount, value)
    }

    static seriesWidth(value: number) {
        return Settings.fill(Selectors.seriesWidth, value)
    }

    static enableNegativeValuesInPlot(value: boolean = true) {
        return Settings.check(Selectors.negativeValuesInPlot, value)
    }

    static enableSimple(value: boolean = true) {
        return Settings.check(Selectors.simple, value)
    }

    static enableTitle(value: boolean = true) {
        return Settings.check(Selectors.title, value)
    }

    static treePadding(value: number) {
        return Settings.fill(Selectors.treePadding, value)
    }

    static enableTooltip(value: boolean = true) {
        return Settings.check(Selectors.tooltip, value)
    }

    static width(value: number) {
        return Settings.fill(Selectors.width, value)
    }

    static height(value: number) {
        return Settings.fill(Selectors.height, value)
    }

    static baseValue(value: number) {
        return Settings.fill(Selectors.baseValue, value)
    }

    static yAxisTitle(value: boolean = true) {
        return Settings.check(Selectors.yAxisTitle, value)
    }
}

export default Settings