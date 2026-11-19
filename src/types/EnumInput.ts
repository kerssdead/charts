type EnumInput<E extends string> = E | `${E}` | number

export default EnumInput