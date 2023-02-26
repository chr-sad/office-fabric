import { defineComponent, h } from 'vue'

import { classNamesFunction } from '@fluentui-vue/utilities'
import type { IProcessedStyleSet } from '@fluentui/merge-styles'
import type { IPersonaStyleProps, IPersonaStyles } from './Persona.types'
import { PersonaPresence, PersonaSize } from './Persona.types'
import { PersonaCoin } from './PersonaCoin'
import { useStylingProps } from '@/utils'

const getClassNames = classNamesFunction<IPersonaStyleProps, IPersonaStyles>()

export const PersonaBase = defineComponent({
  name: 'PersonaBase',

  props: {
    ...useStylingProps(),

    allowPhoneInitials: { type: Boolean, default: false },
    presence: { type: Number as () => PersonaPresence, default: PersonaPresence.none },
    size: { type: Number as () => PersonaSize, default: PersonaSize.size48 },
    coinSize: { type: Number, default: 0 },
    initialsColor: { type: [Number, String], default: undefined },
    hidePersonaDetails: { type: Boolean, default: false },
    text: { type: String, default: null },
    secondaryText: { type: String, default: null },
    tertiaryText: { type: String, default: null },
    optionalText: { type: String, default: null },
    imageUrl: { type: String, default: undefined },
    isOutOfOffice: { type: Boolean, default: false },
    showSecondaryText: { type: Boolean, default: false },
  },

  data() {
    return {
      PersonaSize,
    }
  },

  computed: {
    classNames(): IProcessedStyleSet<IPersonaStyles> {
      const { theme, className, showSecondaryText, presence, size } = this
      return getClassNames(this.styles, {
        theme: theme!,
        className,
        showSecondaryText,
        presence,
        size,
      })
    },
  },

  render() {
    const {
      classNames,
      coinSize,
      text,
      secondaryText,
      tertiaryText,
      optionalText,
      hidePersonaDetails,
      size,
    } = this

    const $details = (!hidePersonaDetails || (size === PersonaSize.size8 || size === PersonaSize.size10 || size === PersonaSize.tiny)) && h('div', { class: classNames.details }, [
      h('div', { class: classNames.primaryText }, text),
      h('div', { class: classNames.secondaryText }, secondaryText),
      h('div', { class: classNames.tertiaryText }, tertiaryText),
      h('div', { class: classNames.optionalText }, optionalText),
      this.$slots.default,
    ])

    return h('div', {
      class: classNames.root,
      style: coinSize ? { height: `${coinSize}px`, minWidth: `${coinSize}px` } : {},
    }, [
      h(PersonaCoin, this.$props),
      $details,
    ])
  },
})
