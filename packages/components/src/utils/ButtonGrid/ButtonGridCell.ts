import { defineComponent, h, toRefs } from 'vue'
import { css } from '@fluentui-vue/utilities'
import { makeStylingProps } from '..'
import { ActionButton } from '@/components'

export const ButtonGridCell = defineComponent({
  name: 'ButtonGridCell',

  props: {
    ...makeStylingProps(),
    item: { type: Object, default: undefined },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: '' },
    cellIsSelectedStyle: { type: String, default: '' },
    cellDisabledStyle: { type: String, default: '' },
    getClassNames: { type: Function, default: undefined },

    onClick: { type: Function, default: undefined },
    onHover: { type: Function, default: undefined },
    onFocus: { type: Function, default: undefined },
    onMouseEnter: { type: Function, default: undefined },
    onMouseMove: { type: Function, default: undefined },
    onMouseLeave: { type: Function, default: undefined },
    onWheel: { type: Function, default: undefined },
    onKeyDown: { type: Function, default: undefined },
  },

  setup(props, { attrs, emit, slots }) {
    const {
      theme,
      styles,
      className,
      item,
      selected,
      disabled,
      label,
      cellIsSelectedStyle,
      cellDisabledStyle,
    } = toRefs(props)

    const handleClick = (event) => {
      if (props.onClick && !props.disabled) {
        props.onClick(props.item, event);
      }
    };

    const handleMouseEnter = (event) => {
      const didUpdateOnEnter = props.onMouseEnter && props.onMouseEnter(event);
      if (!didUpdateOnEnter && props.onHover && !props.disabled) {
        props.onHover(props.item, event);
      }
    };

    const handleMouseMove = (event) => {
      const didUpdateOnMove = props.onMouseMove && props.onMouseMove(event);
      if (!didUpdateOnMove && props.onHover && !props.disabled) {
        props.onHover(props.item, event);
      }
    };

    const handleMouseLeave = (event) => {
      const didUpdateOnLeave = props.onMouseLeave && props.onMouseLeave(event);
      if (!didUpdateOnLeave && props.onHover && !props.disabled) {
        props.onHover(undefined, event);
      }
    };

    const handleFocus = (event) => {
      if (props.onFocus && !props.disabled) {
        props.onFocus(props.item, event);
      }
    };

    const handleWheel = (event) => {
      if (props.onWheel && !props.disabled) {
        props.onWheel(event);
      }
    }

    const handleKeyDown = (event) => {
      if (props.onKeyDown && !props.disabled) {
        props.onKeyDown(event);
      }
    }

    return () => h(ActionButton, {
      ...attrs,
      label: label.value,
      'aria-label': label.value,
      class: css(className.value, {
        [`${cellIsSelectedStyle.value}`]: selected.value,
        [`${cellDisabledStyle.value}`]: disabled.value,
      }),
      getClassNames: props.getClassNames,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onWheel: handleWheel,
      onKeyDown: handleKeyDown,
      disabled: disabled.value
    }, {
      default: () => slots.default?.(item.value),
    })
  },
})
