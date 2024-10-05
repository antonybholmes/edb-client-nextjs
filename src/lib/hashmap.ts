export class HashMap<K, V> extends Map<K, V> {
  get(key: K, defaultValue: V | undefined = undefined) {
    if (super.has(key)) {
      return super.get(key)
    }

    return defaultValue
  }
}
