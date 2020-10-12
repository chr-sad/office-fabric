import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Icon } from '../Icon'
import { IconButton } from '../Button'
import { IRatingProps, IRatingStyles, IRatingStyleProps } from './Rating.types'
import BaseComponent from '../BaseComponent'
import { classNamesFunction } from '@uifabric-vue/utilities'

const getClassNames = classNamesFunction<IRatingStyleProps, IRatingStyles>()

@Component({
  components: { Icon, IconButton },
  inheritAttrs: false,
})
export class RatingBase extends BaseComponent<IRatingProps> {
  @Prop({ type: Number, default: 16 }) size!: number
  @Prop({ type: Number, default: 0 }) min!: number
  @Prop({ type: Number, default: 10 }) max!: number
  @Prop({ type: Number, default: 0 }) rating!: number
  @Prop({ type: String, default: '' }) ariaLabelFormat?: string
  @Prop({ type: String, default: 'FavoriteStarFill' }) iconName!: string
  @Prop({ type: String, default: 'FavoriteStar' }) unselectedIconName!: string
  @Prop({ type: Boolean, default: false }) disabled?: boolean
  @Prop({ type: Boolean, default: false }) readonly?: boolean

  internalValue: number = this.rating

  get classNames () {
    const { disabled, readonly, theme } = this
    return getClassNames(this.styles, {
      disabled,
      readOnly: readonly,
      theme,
    })
  }

  get ratingLevels () {
    const { min, max } = this
    if (min < 0 || max <= min) return []

    let i = min + 1
    return Array(max - min).fill(undefined).map(() => i++)
  }

  get areaLabel () {
    if (!this.ariaLabelFormat) return ''

    return this.ariaLabelFormat.replace('{0}', `${this.internalValue}`).replace('{1}', `${this.max}`)
  }

  getRatingIconName (ratingLevel:number) {
    return this.internalValue >= ratingLevel ? this.iconName : this.unselectedIconName
  }

  getRatingFillPercentage (ratingLevel:number) {
    if (ratingLevel - this.internalValue <= 0) return '100%'
    if (ratingLevel - this.internalValue > 1) return '0%'
    if (ratingLevel - this.internalValue > 0) return `${(1 - (ratingLevel - this.internalValue)) * 100}%`
  }

  setRating (rating:number) {
    this.internalValue = rating
  }

  @Watch('rating')
  private onPropValueChanged (newValue: number) {
    this.internalValue = newValue
  }

  @Watch('internalValue')
  private onValueChanged (value: string) {
    this.$emit('input', value)
  }

  render () {
    const { classNames, readonly, max, size, disabled, iconName } = this
    return (
      <div area-label="areaLabel"
        class={classNames.root}
        style={{ '--size': `${size}px` }}>
        <div class={classNames.ratingFocusZone}>
          {this.ratingLevels.map(ratingLevel => (
            <button
              key={ratingLevel}
              {...{ attrs: this.$attrs }}
              class={classNames.ratingButton}
              disabled={disabled}
              onClick={() => { !disabled && !readonly && this.setRating(ratingLevel) }}>
              <span class={classNames.labelText}>{ `Select ${ratingLevel} of ${max}` }</span>

              <div class={classNames.ratingStar}>
                <Icon
                  icon-name={this.getRatingIconName(ratingLevel)}
                  class={classNames.ratingStarBack} />
                <Icon
                  icon-name={iconName}
                  class={classNames.ratingStarFront}
                  style={{ width: this.getRatingFillPercentage(ratingLevel) }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }
}
