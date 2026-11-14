export type KeyFlag = [key: string, flag: boolean | undefined]

export function mergeKeyFlags(flags: KeyFlag[], previous: Set<string>) {
    const next = new Set<string>()

    for (const [key, flag] of flags)
        if (flag ?? previous.has(key))
            next.add(key)

    return next
}

export function toggleKey(keys: Set<string>, key: string) {
    if (!keys.delete(key))
        keys.add(key)
}