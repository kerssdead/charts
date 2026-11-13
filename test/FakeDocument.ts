import { Events } from '@/static/Enums'

type Listener = (event?: unknown) => void

export class FakeElement {
    readonly tagName: string

    parent: FakeElement | undefined

    children: (FakeElement | string)[] = []

    textContent = ''

    title = ''

    hidden = false

    type = ''

    placeholder = ''

    value = ''

    onclick: (() => void) | undefined

    offsetLeft = 0

    offsetWidth = 0

    scrollHeight = 0

    readonly classes = new Set<string>()

    readonly attributes = new Map<string, string>()

    readonly listeners = new Map<string, Listener[]>()

    readonly style: Record<string, string> & { setProperty(name: string, value: string): void }

    readonly classList = {
        add: (name: string) => this.classes.add(name),
        contains: (name: string) => this.classes.has(name)
    }

    constructor(tagName: string) {
        this.tagName = tagName

        const style: Record<string, string> = {}

        this.style = Object.assign(style, { setProperty: (name: string, value: string) => style[name] = value })
    }

    get elements() {
        return this.children.filter(child => child instanceof FakeElement)
    }

    get text(): string {
        return this.textContent + this.children.map(child => typeof child == 'string' ? child : child.text).join('')
    }

    setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
    }

    getAttribute(name: string) {
        return this.attributes.get(name) ?? null
    }

    append(...nodes: (FakeElement | string)[]) {
        for (const node of nodes) {
            if (node instanceof FakeElement) {
                node.parent?.children.splice(node.parent.children.indexOf(node), 1)
                node.parent = this
            }

            this.children.push(node)
        }
    }

    appendChild(node: FakeElement) {
        this.append(node)
    }

    addEventListener(type: string, listener: Listener) {
        this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
    }

    dispatch(type: string, event?: unknown) {
        for (const listener of this.listeners.get(type) ?? [])
            listener(event)
    }

    click() {
        this.dispatch(Events.Click)
        this.onclick?.()
    }

    findByClass(name: string): FakeElement[] {
        return this.elements.flatMap(child => [
            ...(child.classes.has(name) ? [child] : []),
            ...child.findByClass(name)
        ])
    }
}

export function installFakeDocument() {
    const body = new FakeElement('body')

    Object.assign(globalThis, { document: { body, createElement: (tagName: string) => new FakeElement(tagName) } })

    return body
}