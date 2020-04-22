import { Component, Prop } from 'vue-property-decorator'
import { classNamesFunction } from '@uifabric-vue/utilities'
import StatelessComponent from '../StatelessComponent'
import { CreateElement, RenderContext } from 'vue'
import { ISpinnerProps, SpinnerLabelPosition } from './Spinner.types'

const getClassNames = classNamesFunction()

@Component
export default class Spinner extends StatelessComponent<ISpinnerProps> {
  @Prop({ type: String, default: null }) label!: string
  @Prop({ type: String, default: 'bottom' }) labelPosition!: SpinnerLabelPosition
  @Prop({ type: Number, default: 20 }) size!: number

  render (h: CreateElement, context: RenderContext) {
    const { theme, styles, className, size, label, labelPosition } = context.props
    const classNames: any = getClassNames(styles, {
      theme,
      size,
      className,
      labelPosition,
    })

    return (
      <div class={classNames.root}>
        <div class={classNames.circle} />
        {(context.scopedSlots.default || label) && (
          <div class={classNames.label}>
            {context.scopedSlots.default
              ? context.scopedSlots.default({})
              : label
            }
          </div>
        ) }
      </div>
    )
  }
}
