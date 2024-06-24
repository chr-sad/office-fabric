import { KeyCodes, classNamesFunction } from '@fluentui-vue/utilities'
import { type PropType, computed, defineComponent, h, ref, toRefs } from 'vue'
import { ColorPickerGridCell, type IColorCellProps, type ISwatchColorPickerStyleProps, type ISwatchColorPickerStyles } from '.'
import { makeStylingProps, warnMutuallyExclusive, type IColor } from '@/utils'
import { ButtonGrid } from '@/utils/ButtonGrid'
import { useProxiedModel } from '@/composables'

const getClassNames = classNamesFunction<ISwatchColorPickerStyleProps, ISwatchColorPickerStyles>()

const COMPONENT_NAME = 'SwatchColorPicker'

export const SwatchColorPickerBase = defineComponent({
  name: COMPONENT_NAME,

  props: {
    ...makeStylingProps(),
    colorCells: { type: Array as PropType<IColorCellProps[]>, default: () => [] },
    cellShape: { type: String, default: 'circle', validator: (v: string) => ['circle', 'square'].includes(v) },
    cellHeight: { type: Number, default: undefined },
    cellWidth: { type: Number, default: undefined },
    cellBorderWidth: { type: Number, default: undefined },
    cellMargin: { type: Number, default: 10 },
    disabled: { type: Boolean, default: false },

    columnCount: { type: Number, default: 8 },

    modelValue: { type: String, default: undefined },
    selectedId: { type: String, default: undefined },
    defaultSelectedId: { type: String, default: undefined },

    onColorChanged: { type: Function as PropType<(event?: Event, newSelectedId?: string, color?: string ) => void>, default: undefined },
    onChange: { type: Function as PropType<(event?: Event, newSelectedId?: string, color?: string ) => void>, default: undefined },
    'onUpdate:modelValue': { type: Function as PropType<(newSelectedId?: string, color?: string) => void | undefined>, default: undefined },

    onCellHovered: { type: Function as PropType<(id?: string, color?: string, event?:Event ) => void>, default: undefined },
    onCellFocused: { type: Function as PropType<(id?: string, color?: string, event?:Event ) => void>, default: undefined },

    focusOnHover: { type: Boolean, default: false },

    mouseLeaveParentSelector: { type: String, default: undefined },

    shouldFocusCircularNavigate: { type: Boolean, default: false },
    doNotContainWithinFocusZone: { type: Boolean, default: false },
  },

  setup(props, { attrs, slots }) {
    const {
      theme,
      styles,
      className,
      colorCells,
      cellShape,
      cellHeight,
      cellWidth,
      cellBorderWidth,
      cellMargin,
      disabled,
      columnCount,
      focusOnHover,
      mouseLeaveParentSelector,
      shouldFocusCircularNavigate,
      doNotContainWithinFocusZone,
    } = toRefs(props)

    warnMutuallyExclusive(COMPONENT_NAME, props, {
      modelValue: 'value',
    })

    const selectedId = useProxiedModel(props, 'modelValue', props.selectedId ?? props.defaultSelectedId ?? '')
    const isNavigationIdle = ref(true)
    const navigationIdleTimeoutId = ref<NodeJS.Timeout|undefined>(undefined)
    const navigationIdleDelay = ref(250)
    const cellFocused = ref(false)

    const classNames = computed(() => getClassNames(styles.value, {
      theme: theme.value,
      className: className.value,
      cellMargin: cellMargin.value,
    }))

    const gridStyles = computed(() => ({
      root: classNames.value.root,
      tableCell: classNames.value.tableCell,
      focusedContainer: classNames.value.focusedContainer,
    }))

    const itemsWithIndex = computed(() => colorCells.value.map((item, index) => ({ ...item, index })))

    const mergedOnChange = (ev, newSelectedId) => {
      const newColor = colorCells.value.find(c => c.id === newSelectedId)?.color;
      props.onChange?.(ev, newSelectedId, newColor);
      props.onColorChanged?.(newSelectedId, newColor);
    };

    const isSemanticRadio = computed(() => colorCells.value.length <= columnCount.value);

    const onSwatchColorPickerBlur = event => {
      if (props.onCellFocused) {
        cellFocused.value = false;
        props.onCellFocused(undefined, undefined, event);
      }
    };

    const onMouseEnter = ev => {
      if (!focusOnHover.value) {
        return !isNavigationIdle.value || !!disabled.value;
      }
      if (isNavigationIdle.value && !disabled.value) {
        ev.currentTarget.focus();
      }
      return true;
    };

    const onMouseMove = ev => {
      if (!focusOnHover.value) {
        return !isNavigationIdle || !!disabled.value;
      }

      const targetElement = ev.currentTarget;
      if (isNavigationIdle.value && targetElement !== document.activeElement) {
        targetElement.focus();
      }

      return true;
    };

    const onMouseLeave = ev => {
      const parentSelector = mouseLeaveParentSelector.value;

      if (!props.focusOnHover || !parentSelector || !isNavigationIdle.value || disabled.value) {
        return;
      }

      // Get the elements that math the given selector
      const elements = document?.querySelectorAll(parentSelector) ?? [];

      // iterate over the elements return to make sure it is a parent of the target and focus it
      for (let index = 0; index < elements.length; index += 1) {
        if (elements[index].contains(ev.currentTarget)) {
          /**
           * IE11 focus() method forces parents to scroll to top of element.
           * Edge and IE expose a setActive() function for focusable divs that
           * sets the page focus but does not scroll the parent element.
           */
          if ((elements[index] as any).setActive) {
            try {
              (elements[index] as any).setActive();
            } catch (e) {
              /* no-op */
            }
          } else {
            (elements[index] as HTMLElement).focus();
          }

          break;
        }
      }
    };

    const onGridCellHovered = (item, event) => {
      if (props.onCellHovered) {
        props.onCellHovered(item?.id, item?.color, event);
      }
    };

    const onGridCellFocused = (item, event) => {
      if (props.onCellFocused) {
        cellFocused.value = !!item;
        props.onCellFocused(item?.id, item?.color, event);
      }
    };

    const onCellClick = (item, event) => {
      if (disabled.value || item.disabled) {
        return;
      }

      if (item.id !== selectedId.value) {
        if (props.onCellFocused && cellFocused.value) {
          cellFocused.value = false;
          props.onCellFocused(undefined, undefined, event);
        }
        selectedId.value = item.id;
        mergedOnChange(event, item.id);
      }
    };

    const setNavigationTimeout = () => {
      if (!isNavigationIdle.value && navigationIdleTimeoutId.value !== undefined) {
        clearTimeout(navigationIdleTimeoutId.value);
        navigationIdleTimeoutId.value = undefined;
      } else {
        isNavigationIdle.value = false;
      }

      navigationIdleTimeoutId.value = setTimeout(() => {
        isNavigationIdle.value = true;
      }, navigationIdleDelay.value);
    };

    const onKeyDown = ev => {
      if (
        ev.keyCode === KeyCodes.up ||
        ev.keyCode === KeyCodes.down ||
        ev.keyCode === KeyCodes.left ||
        ev.keyCode === KeyCodes.right
      ) {
        setNavigationTimeout();
      }
    };

    const renderOption = (item: IColorCellProps) => h(ColorPickerGridCell, {
      item,
      color: item.color,
      //styles: getColorGridCellStyles,
      disabled: disabled.value || item.disabled,
      onClick: (ev, item) => onCellClick(item, ev),
      onHover: (ev, item) => onGridCellHovered(item, ev),
      onFocus: (ev, item) => onGridCellFocused(item, ev),
      selected: selectedId.value === item.id,
      circle: cellShape.value === 'circle',
      label: item.label,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onWheel: setNavigationTimeout,
      onKeyDown,
      height: cellHeight.value,
      width: cellWidth.value,
      borderWidth: cellBorderWidth.value,
      isRadio: isSemanticRadio.value,
    })

    return () => h(ButtonGrid, {
      theme: theme.value,
      items: itemsWithIndex.value,
      styles: gridStyles.value,
      columnCount: columnCount.value,
      isSemanticRadio: isSemanticRadio.value,
      shouldFocusCircularNavigate: shouldFocusCircularNavigate.value,
      doNotContainWithinFocusZone: doNotContainWithinFocusZone.value,
      onBlur: onSwatchColorPickerBlur,
    }, {
      default: renderOption,
    })
  },
})
