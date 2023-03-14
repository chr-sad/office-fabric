import { classNamesFunction } from '@fluentui-vue/utilities'
import type { VNode } from 'vue'
import Vue, { CreateElement, VueConstructor, defineComponent, h } from 'vue'
import { CommandBarButton } from '../Button'
import { OverflowSet } from '../OverflowSet'
import { ResizeGroup } from '../ResizeGroup'
import { getCommandButtonStyles } from './CommandBar.styles'
import type { ICommandBarItemProps, ICommandBarStyleProps, ICommandBarStyles } from './CommandBar.types'
import { asSlotProps, useStylingProps } from '@/utils/'

const getClassNames = classNamesFunction<ICommandBarStyleProps, ICommandBarStyles>()

export interface ICommandBarData {
  /**
   * Items being rendered in the primary region
   */
  primaryItems: ICommandBarItemProps[]
  /**
   * Items being rendered in the overflow
   */
  overflowItems: ICommandBarItemProps[]
  /**
   * Items being rendered on the far side
   */
  farItems: ICommandBarItemProps[] | undefined
  /**
   * Length of original overflowItems to ensure that they are not moved into primary region on resize
   */
  minimumOverflowItems: number
  /**
   * Unique string used to cache the width of the command bar
   */
  cacheKey: string
}

export const CommandBarBase = defineComponent({
  name: 'CommandBarBase',

  props: {
    ...useStylingProps(),

    items: { type: Array as () => any[], default: () => [] },
    overflowItems: { type: Array as () => any[], default: () => [] },
    farItems: { type: Array as () => any[], default: () => [] },

    shiftOnReduce: { type: Boolean, default: false },
    overflowButtonProps: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      dataToRender: null,
    }
  },

  computed: {
    classNames(): any {
      const { styles, theme } = this
      return getClassNames(styles, {
        theme,
      })
    },

    commandBarData(): ICommandBarData {
      const {
        items,
        overflowItems,
        farItems,
      } = this
      return {
        primaryItems: [...items],
        overflowItems: [...overflowItems!],
        minimumOverflowItems: [...overflowItems!].length, // for tracking
        farItems,
        cacheKey: this.computeCacheKey({
          primaryItems: [...items],
          overflow: overflowItems && overflowItems.length > 0,
          farItems,
        }),
      }
    },
  },

  watch: {
    commandBarData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.dataToRender = val
      },
    },
  },

  methods: {
    computeCacheKey(data: {
      primaryItems?: ICommandBarItemProps[]
      overflow?: boolean
      farItems?: ICommandBarItemProps[]
    }): string {
      const { primaryItems, overflow, farItems } = data
      const returnKey = (acc: string, current: ICommandBarItemProps): string => {
        const { cacheKey = current.key } = current
        return acc + cacheKey
      }

      const primaryKey = primaryItems && primaryItems.reduce(returnKey, '')
      const overflowKey = overflow ? 'overflow' : ''
      const farKey = farItems && farItems.reduce(returnKey, '')

      return [primaryKey, overflowKey, farKey].join('')
    },
    onReduceData(data: any): any | undefined {
      const { shiftOnReduce } = this
      let { primaryItems, overflowItems, cacheKey } = data
      const { farItems } = data

      // Use first item if shiftOnReduce, otherwise use last item
      const movedItem = primaryItems[shiftOnReduce ? 0 : primaryItems.length - 1]

      if (movedItem !== undefined) {
        movedItem.renderedInOverflow = true

        overflowItems = [movedItem, ...overflowItems]
        primaryItems = shiftOnReduce ? primaryItems.slice(1) : primaryItems.slice(0, -1)

        const newData = { ...data, primaryItems, overflowItems }
        cacheKey = this.computeCacheKey({ primaryItems, overflow: overflowItems.length > 0, farItems })

        newData.cacheKey = cacheKey
        return newData
      }

      return undefined
    },
    onGrowData(data: any): any | undefined {
      const { shiftOnReduce } = this
      const { minimumOverflowItems } = data
      let { primaryItems, overflowItems, cacheKey } = data
      const { farItems } = data
      const movedItem = overflowItems[0]

      // Make sure that moved item exists and is not one of the original overflow items
      if (movedItem !== undefined && overflowItems.length > minimumOverflowItems) {
        movedItem.renderedInOverflow = false

        overflowItems = overflowItems.slice(1)
        // if shiftOnReduce, movedItem goes first, otherwise, last.
        primaryItems = shiftOnReduce ? [movedItem, ...primaryItems] : [...primaryItems, movedItem]

        const newData = { ...data, primaryItems, overflowItems }
        cacheKey = this.computeCacheKey({ primaryItems, overflow: overflowItems.length > 0, farItems })

        newData.cacheKey = cacheKey
        return newData
      }

      return undefined
    },

    onRenderItem(item: any): VNode {
      const commandButtonProps: ICommandBarItemProps = {
        allowDisabledFocus: true,
        role: 'menuitem',
        ...item,
        styles: getCommandButtonStyles(item.buttonStyles),
        text: !item.iconOnly ? item.text : undefined,
        menuProps: item.subMenuProps,
      }

      return h(CommandBarButton, {
        class: ['ms-CommandBarItem-link', item.className],
        ...commandButtonProps,
      }, () => item.text)
    },
  },

  render(): VNode {
    const {
      classNames,
      onRenderItem,
    } = this
    const data = this.dataToRender

    return h(ResizeGroup, {
      data,
      onReduceData: this.onReduceData,
      onGrowData: this.onGrowData,
    }, {
      default: data => [
        h('div', {
          class: classNames.root,
        }, {
          default: () => [
            h(OverflowSet, {
              ref: 'overflow',
              class: classNames.primarySet,
              items: data.primaryItems.map(i => ({
                ...i,
                text: !i.iconOnly ? i.text : undefined,
              })),
              overflowItems: data.overflowItems.length ? data.overflowItems : undefined,
            }, {
              item: ({ item }) => {
                if (item.key in this.$slots) {
                  return this.$slots[item.key]!({
                    item,
                    render: onRenderItem,
                  })
                }
                return onRenderItem(item)
              },
              overflow: (overflowItems) => {
                const { overflowButtonProps = {} } = this

                const combinedOverflowItems: any[] = [
                  ...(overflowButtonProps.menuProps ? overflowButtonProps.menuProps.items : []),
                  ...overflowItems,
                ]

                return h(CommandBarButton, {
                  role: 'menuitem',
                  ...overflowButtonProps,
                  styles: { menuIcon: { fontSize: '17px' }, ...overflowButtonProps.styles },
                  className: ['ms-CommandBar-overflowButton', overflowButtonProps.className].join(' '),
                  menuProps: { ...overflowButtonProps.menuProps, items: combinedOverflowItems },
                  menuIconProps: { iconName: 'More', ...overflowButtonProps.menuIconProps },
                })
              },
            }),
            h(OverflowSet, {
              class: classNames.secondarySet,
              items: data.farItems.map(i => ({
                ...i,
                text: !i.iconOnly ? i.text : undefined,
              })),
            }, {
              item: ({ item }) => onRenderItem(item),
            }),
          ],
        }),
      ],
    })
  },
})
