import { findRegressions } from '../e2e/utils/Baseline'
import { Metrics } from '../e2e/utils/Metrics'

const baseline: Metrics = {
    create: 100,
    initFrameAvg: 10,
    hoverFrameAvg: 5,
    hoverExtra: 20,
    idleFrames: 2,
    update: 30,
    updateFrameAvg: 8
}

describe('Finding performance regressions', () => {
    it('Should report nothing when metrics equal the baseline', () => {
        expect(findRegressions(baseline, { ...baseline }))
            .toEqual([])
    })

    it('Should report nothing when metrics improve', () => {
        expect(findRegressions(baseline, { ...baseline, create: 10, hoverExtra: 0 }))
            .toEqual([])
    })

    it('Should allow a metric exactly at its limit', () => {
        expect(findRegressions(baseline, { ...baseline, create: 400 }))
            .toEqual([])
    })

    it('Should report a metric above its limit', () => {
        expect(findRegressions(baseline, { ...baseline, create: 401 }))
            .toEqual(['create: 401.00 (baseline 100.00, limit 400.00)'])
    })

    it('Should allow noise on a near-zero baseline through the floor', () => {
        expect(findRegressions({ ...baseline, hoverExtra: 0 }, { ...baseline, hoverExtra: 60 }))
            .toEqual([])
    })

    it('Should report every regressed metric', () => {
        const actual = { ...baseline, idleFrames: 20, update: 500 }

        expect(findRegressions(baseline, actual))
            .toEqual([
                'idleFrames: 20.00 (baseline 2.00, limit 7.00)',
                'update: 500.00 (baseline 30.00, limit 85.00)'
            ])
    })
})