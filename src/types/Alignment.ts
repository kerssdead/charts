import { HorizontalAlignment, VerticalAlignment } from '../static/Enums'

export class Alignment {
    x: HorizontalAlignment = HorizontalAlignment.Center

    y: VerticalAlignment = VerticalAlignment.Center

    static get default(): Alignment {
        return {
            x: HorizontalAlignment.Center,
            y: VerticalAlignment.Center
        }
    }
}