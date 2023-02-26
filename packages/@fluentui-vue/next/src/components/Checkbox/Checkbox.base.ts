import { classNamesFunction, getId } from '@fluentui-vue/utilities'
import type { PropType } from 'vue'
import { computed, defineComponent, h, ref, toRefs, watch } from 'vue'
import { Label } from '../Label'
import { Icon } from '../Icon'
import type { ICheckboxStyleProps, ICheckboxStyles } from './Checkbox.types'
import { useStylingProps } from '@/utils/'
import type { SlotProps } from '@/utils/'

export type CheckboxLabelPosition = 'top' | 'right' | 'bottom' | 'left'

const getClassNames = classNamesFunction<ICheckboxStyleProps, ICheckboxStyles>()

export const CheckboxBase = defineComponent({
  name: 'CheckboxBase',

  model: {
    prop: 'checked',
    event: 'input',
  },

  props: {
    ...useStylingProps<ICheckboxStyleProps, ICheckboxStyles>(),

    checked: { type: Boolean, default: false },
    defaultChecked: { type: Boolean, default: false },
    indeterminate: { type: Boolean, default: false },
    defaultIndeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    label: { type: String, default: null },
    title: { type: String, default: null },
    boxSide: {
      type: String as PropType<'start' | 'end'>,
      default: 'start',
      validator: (v: string) => ['start', 'end'].includes(v),
    },
    inputProps: { type: Object as () => any, default: undefined },

    checkmarkIconProps: { type: Object as () => any, default: undefined },

    modelValue: { type: Boolean, default: false },
  },

  setup(props, { attrs, emit, slots }) {
    const {
      modelValue, defaultChecked, indeterminate, defaultIndeterminate,
      theme, styles, className, disabled, boxSide,
      checkmarkIconProps,
      title,
      inputProps,
      label,
    } = toRefs(props)

    const id = computed(() => getId('Checkbox'))

    const internalValue = ref(modelValue.value || defaultChecked.value)
    const isIndeterminate = ref(indeterminate.value || defaultIndeterminate.value)

    watch(modelValue, (value) => {
      internalValue.value = value
    })

    const classNames = computed(() => getClassNames(styles.value, {
      theme: theme.value,
      className: className.value,
      disabled: disabled.value,
      indeterminate: isIndeterminate.value,
      checked: isIndeterminate.value ? false : internalValue.value,
      reversed: boxSide.value !== 'start',
      isUsingCustomLabelRender: true,
    }))

    const onInput = () => {
      if (disabled.value)
        return

      if (isIndeterminate.value) {
        internalValue.value = defaultChecked.value
        isIndeterminate.value = false
      }
      else {
        internalValue.value = !internalValue.value
      }
      emit('update:modelValue', internalValue.value)
    }

    const slotProps = computed<SlotProps<ICheckboxStyles>>(() => ({
      root: {
        class: classNames.value.root,
      },
      input: {
        class: classNames.value.input,
        id: id.value,
        ...attrs,
        ...inputProps.value,
        disabled: disabled.value,
        type: 'checkbox',
        onInput,
      },
      label: {
        class: classNames.value.label,
        for: id.value,
      },
      checkbox: {
        class: classNames.value.checkbox,
      },
      checkmark: {
        class: classNames.value.checkmark,
        iconName: 'CheckMark',
        ...checkmarkIconProps.value,
      },
      text: {
        class: classNames.value.text,
        title: title.value,
      },
    }))

    return () => h('div', slotProps.value.root, [
      h('input', slotProps.value.input),

      h(Label, slotProps.value.label, () => [
        h('div', slotProps.value.checkbox, [
          h(Icon, slotProps.value.checkmark),
        ]),
        (slots.default || label.value) && h('span', slotProps.value.text, slots.default ? slots : label.value),
      ]),
    ])
  },
})
