import { mergeStyles } from '@fluentui/merge-styles'

/**
 * Builds a class names object from a given map.
 *
 * @param styles - Map of unprocessed styles.
 * @returns Map of property name to class name.
 */
export function buildClassMap<T extends Object> (styles: T): { [key in keyof T]?: string } {
  const classes: { [key in keyof T]?: string } = {}

  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      let className: string

      Object.defineProperty(classes, styleName, {
        get: (): string => {
          if (className === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            className = mergeStyles(styles[styleName] as any).toString()
          }
          return className
        },
        enumerable: true,
        configurable: true,
      })
    }
  }

  return classes
}
