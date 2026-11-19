import { setTextOverrides, TextOverrides } from '@/static/TextResources'
import Translations from '@/static/Translations'

let locale: string | undefined

const resetCallbacks: (() => void)[] = []

export function getLocale() {
    return locale
}

function getTranslation(locale: string | undefined) {
    const tag = locale?.toLowerCase().replace('_', '-')

    if (!tag)
        return undefined

    return Translations[tag] ?? Translations[tag.split('-')[0]]
}

export function setLocalization(newLocale: string | undefined, strings: TextOverrides | undefined) {
    setTextOverrides({ ...getTranslation(newLocale), ...strings })

    if (newLocale === locale)
        return

    locale = newLocale

    for (const reset of resetCallbacks)
        reset()
}

export function localeCached<T>(create: (locale: string | undefined) => T): () => T {
    let value: T | undefined

    resetCallbacks.push(() => value = undefined)

    return () => value ??= create(locale)
}