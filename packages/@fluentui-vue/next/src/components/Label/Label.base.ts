import { classNamesFunction } from '@fluentui-vue/utilities'
import { defineComponent, h } from 'vue'
import type { ILabelStyleProps, ILabelStyles } from './Label.types'
import { asSlotProps, useStylingProps } from '@/utils/'

const getClassNames = classNamesFunction<ILabelStyleProps, ILabelStyles>()

export const LabelBase = defineComponent({
  name: 'LabelBase',

  props: {
    ...useStylingProps(),

    as: { type: String, default: 'label' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },

  setup(props, { attrs, slots }) {
    const { styles, theme, className, as: RootType, disabled, required } = props

    const classNames = getClassNames(styles, {
      theme,
      className,
      disabled,
      required,
    })

    const slotProps = asSlotProps<ILabelStyles>({
      root: {
        ...attrs,
        class: classNames.root,
      },
    })

    return () => h(RootType, slotProps.root, slots)
  },
})
