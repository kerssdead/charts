import { getSteps } from '@/render/gauge/GaugeSteps'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting gauge steps', () => {
    it('Should place three steps between min and max', () => {
        const steps = getSteps(0, 100, value => value.toString())

        expect(steps.map(step => step.text))
            .toEqual(['25', '50', '75'])
        expect(steps.map(step => step.angle))
            .toEqual([Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75])
        expect(steps.map(step => step.textWidth))
            .toEqual([14, 14, 14])
    })

    it('Should use min and max offset', () => {
        expect(getSteps(-40, 40, value => value.toString()).map(step => step.text))
            .toEqual(['-20', '0', '20'])
    })
})