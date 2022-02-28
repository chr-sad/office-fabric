import { withThemeableProps } from '@/useThemeable'
import { CreateElement, VNode } from 'vue'
import { Vue } from 'vue-property-decorator'
import { DirectionalHint } from '../../common/DirectionalHint'
import { Layer } from '../Layer'
import { CalloutContent } from './CalloutContent'

export const Callout = Vue.extend({
  functional: true,

  props: {
    ...withThemeableProps(),
    target: { type: [HTMLElement, Object], required: true },
    doNotLayer: { type: Boolean, default: false },
    directionalHint: { type: Number, default: DirectionalHint.bottomAutoEdge },
  },

  // @ts-ignore
  render (h: CreateElement, context: any): VNode | undefined {
    const { layerProps, ...rest } = context.props

    const content = h(CalloutContent, {
      ...context.data,
      props: {
        ...rest,
        ...context.data.props,
        ...context.data.attrs,
      },
    }, context.children)

    return context.props.doNotLayer
      ? content
      : h(Layer, {
        ...context.data,
        props: layerProps,
      }, [content])
  },
})
