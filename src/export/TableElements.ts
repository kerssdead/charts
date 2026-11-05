import { AriaRole, Attribute, TableClasses, Tag } from '@/static/Enums'

export function div(className?: string, children: HTMLElement[] = [], role?: AriaRole) {
    const element = document.createElement(Tag.Div)

    if (className)
        element.classList.add(className)

    if (role)
        element.setAttribute(Attribute.Role, role)

    for (const child of children)
        element.append(child)

    return element
}

export function cell(value: string, role: AriaRole = AriaRole.Cell, title: string = value) {
    const element = div(undefined, [], role)

    element.textContent = value
    element.title = title

    return element
}

export function asNumberCell(element: HTMLElement) {
    element.classList.add(TableClasses.Number)

    return element
}

export function caption(title: string) {
    const element = div(TableClasses.Caption)

    element.textContent = title

    return element
}

export function button(text: string, onClick: (button: HTMLButtonElement) => void) {
    const element = document.createElement(Tag.Button)

    element.classList.add(TableClasses.Action)
    element.type = 'button'
    element.textContent = text
    element.onclick = () => onClick(element)

    return element
}