import { IsFocusVisibleClassName } from '@uifabric-vue/utilities'
import { getFocusStyle, HighContrastSelector, FontWeights, getGlobalClassNames, getScreenSelector, ScreenWidthMinMedium, ScreenWidthMaxMedium, ScreenWidthMaxSmall } from '@uifabric/styling'
import { IRawStyle } from '@uifabric/merge-styles'
import { IBreadcrumbStyles } from './Breadcrumb.types'

const GlobalClassNames = {
  root: 'ms-Breadcrumb',
  list: 'ms-Breadcrumb-list',
  listItem: 'ms-Breadcrumb-listItem',
  chevron: 'ms-Breadcrumb-chevron',
  overflow: 'ms-Breadcrumb-overflow',
  overflowButton: 'ms-Breadcrumb-overflowButton',
  itemLink: 'ms-Breadcrumb-itemLink',
  item: 'ms-Breadcrumb-item',
}

const SingleLineTextStyle: IRawStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const overflowButtonFontSize = 16
const chevronSmallFontSize = 8
const itemLineHeight = 36
const itemFontSize = 18

const MinimumScreenSelector = getScreenSelector(0, ScreenWidthMaxSmall)
const MediumScreenSelector = getScreenSelector(ScreenWidthMinMedium, ScreenWidthMaxMedium)

export const getStyles = (props: any): IBreadcrumbStyles => {
  const { className, theme } = props
  const { palette, semanticColors, fonts } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  // Tokens
  const itemBackgroundHoveredColor = semanticColors.menuItemBackgroundHovered
  const itemBackgroundPressedColor = semanticColors.menuItemBackgroundPressed
  const itemTextColor = palette.neutralSecondary
  const itemTextFontWeight = FontWeights.regular
  const itemTextHoveredOrPressedColor = palette.neutralPrimary
  const itemLastChildTextColor = palette.neutralPrimary
  const itemLastChildTextFontWeight = FontWeights.semibold
  const chevronButtonColor = palette.neutralSecondary
  const overflowButtonColor = palette.neutralSecondary

  const lastChildItemStyles: IRawStyle = {
    fontWeight: itemLastChildTextFontWeight,
    color: itemLastChildTextColor,
  }

  const itemStateSelectors = {
    ':hover': {
      color: itemTextHoveredOrPressedColor,
      backgroundColor: itemBackgroundHoveredColor,
      cursor: 'pointer',
      selectors: {
        [HighContrastSelector]: {
          color: 'Highlight',
        },
      },
    },
    ':active': {
      backgroundColor: itemBackgroundPressedColor,
      color: itemTextHoveredOrPressedColor,
    },
    '&:active:hover': {
      color: itemTextHoveredOrPressedColor,
      backgroundColor: itemBackgroundPressedColor,
    },
    '&:active, &:hover, &:active:hover': {
      textDecoration: 'none',
    },
  }

  const commonItemStyles: IRawStyle = {
    color: itemTextColor,
    padding: '0 8px',
    lineHeight: itemLineHeight,
    fontSize: itemFontSize,
    fontWeight: itemTextFontWeight,
  }

  return {
    root: [
      classNames.root,
      fonts.medium,
      {
        margin: '11px 0 1px',
      },
      className,
    ],

    list: [
      classNames.list,
      {
        whiteSpace: 'nowrap',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'stretch',
      },
    ],

    listItem: [
      classNames.listItem,
      {
        listStyleType: 'none',
        margin: '0',
        padding: '0',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        selectors: {
          '&:last-child .ms-Breadcrumb-itemLink': lastChildItemStyles,
          '&:last-child .ms-Breadcrumb-item': lastChildItemStyles,
        },
      },
    ],

    chevron: [
      classNames.chevron,
      {
        color: chevronButtonColor,
        fontSize: fonts.small.fontSize,
        selectors: {
          [HighContrastSelector]: {
            color: 'WindowText',
            MsHighContrastAdjust: 'none',
          },
          [MediumScreenSelector]: {
            fontSize: chevronSmallFontSize,
          },
          [MinimumScreenSelector]: {
            fontSize: chevronSmallFontSize,
          },
        },
      },
    ],

    overflow: [
      classNames.overflow,
      {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      },
    ],

    overflowButton: [
      classNames.overflowButton,
      getFocusStyle(theme),
      SingleLineTextStyle,
      {
        fontSize: overflowButtonFontSize,
        color: overflowButtonColor,
        height: '100%',
        cursor: 'pointer',
        selectors: {
          ...itemStateSelectors,
          [MinimumScreenSelector]: {
            padding: '4px 6px',
          },
          [MediumScreenSelector]: {
            fontSize: fonts.mediumPlus.fontSize,
          },
        },
      },
    ],

    itemLink: [
      classNames.itemLink,
      getFocusStyle(theme),
      SingleLineTextStyle,
      {
        ...commonItemStyles,
        selectors: {
          ':focus': {
            color: palette.neutralDark,
          },
          [`.${IsFocusVisibleClassName} &:focus`]: {
            outline: 'none',
          },
          ...itemStateSelectors,
        },
      },
    ],

    item: [
      classNames.item,
      {
        ...commonItemStyles,
        selectors: {
          ':hover': {
            cursor: 'default',
          },
        },
      },
    ],
  }
}
