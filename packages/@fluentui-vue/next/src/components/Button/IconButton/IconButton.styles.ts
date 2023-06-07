import { type ITheme, Palette, SemanticColors } from '@fluentui-vue/theme'
import { memoizeFunction } from '@fluentui-vue/utilities'
import { concatStyleSets } from '@fluentui/merge-styles'
import { HighContrastSelector } from '@fluentui-vue/style-utilities'
import { getStyles as getBaseButtonStyles } from '../BaseButton.styles'
import type { IButtonStyles } from '../Button.types'

export const getStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IButtonStyles): IButtonStyles => {
    const baseButtonStyles: IButtonStyles = getBaseButtonStyles(theme)
    // const splitButtonStyles: IButtonStyles = getSplitButtonStyles(theme)
    const iconButtonStyles: IButtonStyles = {
      root: {
        padding: '0 4px',
        width: '32px',
        height: '32px',
        backgroundColor: 'transparent',
        border: 'none',
        color: SemanticColors.link,
      },

      rootHovered: {
        color: Palette.themeDarkAlt,
        backgroundColor: Palette.neutralLighter,
        selectors: {
          [HighContrastSelector]: {
            borderColor: 'Highlight',
            color: 'Highlight',
          },
        },
      },

      rootHasMenu: {
        width: 'auto',
      },

      rootPressed: {
        color: Palette.themeDark,
        backgroundColor: Palette.neutralLight,
      },

      rootExpanded: {
        color: Palette.themeDark,
        backgroundColor: Palette.neutralLight,
      },

      rootChecked: {
        color: Palette.themeDark,
        backgroundColor: Palette.neutralLight,
      },

      rootCheckedHovered: {
        color: Palette.themeDark,
        backgroundColor: Palette.neutralQuaternaryAlt,
      },

      rootDisabled: {
        color: Palette.neutralTertiaryAlt,
      },
    }

    return concatStyleSets(baseButtonStyles, iconButtonStyles, /* splitButtonStyles, */ customStyles)!
  },
)
