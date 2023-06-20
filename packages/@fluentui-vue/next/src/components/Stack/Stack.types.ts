/**
 * Defines a type made by the union of the different values that the align-items and justify-content flexbox
 * properties can take.
 * {@docCategory Stack}
 */
export type Alignment =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'baseline'
  | 'stretch'

/**
 * {@docCategory Stack}
 */
export type IStackComponent = any

// The following two types are redundant with IStackComponent but are needed until TS function return widening issue
// is resolved: https://github.com/Microsoft/TypeScript/issues/241
// For now, these helper types can be used to provide return type safety when specifying tokens and styles functions.

/**
 * {@docCategory Stack}
 */
export type IStackTokenReturnType = ReturnType<Extract<IStackComponent['tokens'], Function>>

/**
 * {@docCategory Stack}
 */
export type IStackStylesReturnType = ReturnType<Extract<IStackComponent['styles'], Function>>

/**
 * {@docCategory Stack}
 */
export type IStackSlot = any

/**
 * {@docCategory Stack}
 */
export interface IStackSlots {
}

/**
 * {@docCategory Stack}
 */
export interface IStackProps {
  /**
   * Defines whether to render Stack children horizontally.
   * @defaultvalue false
   */
  horizontal?: boolean

  /**
   * Defines whether to render Stack children in the opposite direction (bottom-to-top if it's a vertical Stack and
   * right-to-left if it's a horizontal Stack).
   * @defaultvalue false
   */
  reversed?: boolean

  /**
   * Defines how to align Stack children horizontally (along the x-axis).
   */
  horizontalAlign?: Alignment

  /**
   * Defines how to align Stack children vertically (along the y-axis).
   */
  verticalAlign?: Alignment

  /**
   * Defines whether the Stack should take up 100% of the height of its parent.
   * This property is required to be set to true when using the `grow` flag on children in vertical oriented Stacks.
   * Stacks are rendered as block elements and grow horizontally to the container already.
   * @defaultvalue false
   */
  verticalFill?: boolean

  /**
   * Defines whether Stack children should not shrink to fit the available space.
   * @defaultvalue false
   */
  disableShrink?: boolean

  /**
   * Defines how much to grow the Stack in proportion to its siblings.
   */
  grow?: boolean | number | 'inherit' | 'initial' | 'unset'

  /**
   * Defines whether Stack children should wrap onto multiple rows or columns when they are about to overflow
   * the size of the Stack.
   * @defaultvalue false
   */
  wrap?: boolean
}

/**
 * {@docCategory Stack}
 */
export interface IStackTokens {
  /**
   * Defines the spacing between Stack children.
   * The property is specified as a value for 'row gap', followed optionally by a value for 'column gap'.
   * If 'column gap' is omitted, it's set to the same value as 'row gap'.
   */
  childrenGap?: number | string

  /**
   * Defines a maximum height for the Stack.
   */
  maxHeight?: number | string

  /**
   * Defines a maximum width for the Stack.
   */
  maxWidth?: number | string

  /**
   * Defines the padding to be applied to the Stack contents relative to its border.
   */
  padding?: number | string
}

/**
 * {@docCategory Stack}
 */
export type IStackStyles = any
