interface Map<K, V> {
    trySet: (key: K, value: V) => void
}