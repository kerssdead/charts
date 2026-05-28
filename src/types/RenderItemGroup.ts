import RenderItem from './RenderItem'
import { RenderGroupDirection } from '../static/Enums'
import Margin from './Margin'

export default class RenderItemGroup {
    items: RenderItem[]

    direction: RenderGroupDirection

    margin: Margin

    actions: void

    style: void

    gap: number

    // todo: not implemented
}