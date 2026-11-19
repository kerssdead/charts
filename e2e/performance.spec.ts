import { expect, test } from '@playwright/test'
import { measureScenario, SCENARIOS } from './utils/Benchmark'
import { findRegressions, isUpdating, readScenario, writeScenario } from './utils/Baseline'

test.describe('Performance', () => {
    for (const scenario of SCENARIOS) {
        test(`${ scenario } should stay within the baseline`, async ({ page }) => {
            const metrics = await measureScenario(page, scenario)

            if (isUpdating()) {
                writeScenario(scenario, metrics)

                return
            }

            const baseline = readScenario(scenario)

            if (!baseline)
                throw new Error(`No baseline for "${ scenario }". Run npm run e2e-baseline`)

            expect(findRegressions(baseline, metrics))
                .toEqual([])
        })
    }
})