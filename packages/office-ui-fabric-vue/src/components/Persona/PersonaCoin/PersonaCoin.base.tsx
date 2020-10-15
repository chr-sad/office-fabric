import { Vue, Component, Prop } from 'vue-property-decorator'
import BaseComponent from '../../BaseComponent'
import { classNamesFunction, getInitials, getRTL } from '@uifabric-vue/utilities'
import { mergeStyles } from '@uifabric/merge-styles'
import { getPersonaInitialsColor } from '../PersonaInitialsColor'
import {
  PersonaSize,
  PersonaPresence as PersonaPresenceEnum,
  IPersonaCoinStyleProps,
  IPersonaCoinStyles,
  IPersonaCoinProps,
} from '../Persona.types'
import { PersonaPresence } from '../PersonaPresence/'
import { sizeBoolean, sizeToPixels } from '../PersonaConsts'
import { ImageFit, Image } from '../../Image'
import { Icon } from '../../Icon'
import { CreateElement } from 'vue'

const getClassNames = classNamesFunction<IPersonaCoinStyleProps, IPersonaCoinStyles>({
  // There can be many PersonaCoin rendered with different sizes.
  // Therefore setting a larger cache size.
  cacheSize: 100,
})

@Component({
  inheritAttrs: false,
  components: { Icon, OImage: Image, PersonaPresence },
})
export class PersonaCoinBase extends BaseComponent<IPersonaCoinProps> {
  @Prop({ type: Boolean, default: false }) allowPhoneInitials!: boolean
  @Prop({ type: Number, default: PersonaPresenceEnum.none }) presence!: number
  @Prop({ type: Number, default: null }) size!: number
  @Prop({ type: Number, default: null }) coinSize!: number

  @Prop() coinProps!: any
  @Prop() showUnknownPersonaCoin!: any
  @Prop() isOutOfOffice!: any
  @Prop() presenceTitle!: any
  @Prop() imageUrl!: any
  @Prop() imageInitials!: any
  @Prop() text!: any
  @Prop() initialsColor!: any

  mergeStyles = mergeStyles
  getPersonaInitialsColor = getPersonaInitialsColor
  PersonaSize = PersonaSize
  ImageFit = ImageFit

  get initials () {
    const { imageInitials, allowPhoneInitials, showUnknownPersonaCoin } = this
    const isRTL = getRTL(this.theme)

    return imageInitials || getInitials(this.text, isRTL, allowPhoneInitials)
  }

  get dimension () {
    const { coinSize, size } = this
    return coinSize || sizeToPixels[size]
  }

  get personaPresenceProps () {
    const { coinSize, theme, isOutOfOffice, presence, presenceTitle, size } = this
    return {
      coinSize,
      isOutOfOffice,
      presence,
      presenceTitle,
      size,
      theme,
    }
  }

  get shouldRenderInitials () {
    return !this.imageUrl
  }

  get coinSizeStyle () {
    const { coinSize } = this
    return coinSize ? { width: coinSize, height: coinSize } : undefined
  }

  get classNames () {
    const { styles, theme, className, coinProps, size, coinSize, showUnknownPersonaCoin } = this
    return getClassNames(styles, {
      theme: theme!,
      className: coinProps && coinProps.className ? coinProps.className : className,
      size,
      coinSize,
      showUnknownPersonaCoin,
    })
  }

  render (h: CreateElement) {
    const { classNames, size, initials, presence, personaPresenceProps, coinSizeStyle, shouldRenderInitials, showUnknownPersonaCoin, imageUrl, dimension } = this
    return (
      <div role="presentation" class={classNames.coin}>
        {(size !== PersonaSize.size8) ? (
          <div role="presentation"
            class={classNames.imageArea}
            style={coinSizeStyle}>
            { shouldRenderInitials && (
              <div class={mergeStyles(
                classNames.initials,
                !showUnknownPersonaCoin && { backgroundColor: getPersonaInitialsColor(this.$props as any) },
              )}
              style={coinSizeStyle}
              aria-hidden="true">
                {initials
                  ? (<span>{initials}</span>)
                  : (<Icon icon-name="Contact" />)
                }
              </div>
            )}

            {imageUrl && (
              <Image
                class={classNames.image}
                image-fit={ImageFit.cover}
                src={imageUrl}
                width={dimension}
                height={dimension} />
            )}
            <PersonaPresence {...{ props: personaPresenceProps }} />
          </div>
        ) : presence
          ? (<PersonaPresence {...{ props: personaPresenceProps }} />)
          : (<Icon icon-name="Contact" class={classNames.size10WithoutPresenceIcon} />)}

        {this.$slots.default}
      </div>
    )
  }
}
