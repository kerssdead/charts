import { Tag } from '@/static/Enums'
import Styles from '@/static/constants/Styles'
import TextResources from '@/static/TextResources'

export function createErrorMessage() {
    const message = document.createElement(Tag.Div)

    message.textContent = TextResources.somethingWentWrong
    message.style.display = Styles.Display.Flex
    message.style.alignItems = Styles.AlignItems.Center
    message.style.justifyContent = Styles.JustifyContent.Center
    message.style.width = Styles.Size.Full
    message.style.height = Styles.Size.Full

    return message
}