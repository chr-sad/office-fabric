import { hiddenContentStyle } from '@/style-utilities/styles'
import type { IStyleFunction } from '@fluentui/merge-styles'
import type { IAnnouncedStyleProps, IAnnouncedStyles } from './Announced.types'

export const getStyles: IStyleFunction<IAnnouncedStyleProps, IAnnouncedStyles> = props => {
  return {
    root: props.className,
    screenReaderText: hiddenContentStyle,
  }
}
