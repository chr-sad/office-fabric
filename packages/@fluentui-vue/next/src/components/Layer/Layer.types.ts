import type { ITheme } from '@fluentui-vue/theme'
import type { IStyle, IStyleFunctionOrObject } from '@fluentui/merge-styles'

/**
 * {@docCategory Layer}
 */
export interface ILayer {}

/**
  * {@docCategory Layer}
  */
export interface ILayerProps {
  /**
    * Call to provide customized styling that will layer on top of the variant rules
    */
  styles?: IStyleFunctionOrObject<ILayerStyleProps, ILayerStyles>

  /**
    * Theme provided by HOC.
    */
  theme?: ITheme

  /**
    * Additional css class to apply to the Layer
    * @defaultvalue undefined
    */
  className?: string

  /**
    * Callback for when the layer is mounted.
    */
  onLayerDidMount?: () => void

  /**
    * Callback for when the layer is unmounted.
    */
  onLayerWillUnmount?: () => void

  /**
    * The optional id property provided on a LayerHost that this Layer should render within. The LayerHost does
    * not need to be immediately available but once has been rendered, and if missing, we'll avoid trying
    * to render the Layer content until the host is available. If an id is not provided, we will render the Layer
    * content in a fixed position element rendered at the end of the document.
    */
  hostId?: string

  /**
    * When enabled, Layer allows events to bubble up from Layer content.
    * Traditionally Layer has not had this behavior. This prop preserves backwards compatibility by
    * default while allowing users to opt in to the new event bubbling functionality.
    */
  eventBubblingEnabled?: boolean

  /**
    * Whether the layer should be added as the first child of the host.
    * If true, the layer will be inserted as the first child of the host
    * By default, the layer will be appended at the end to the host
    */
  insertFirst?: boolean
}

/**
 * {@docCategory Layer}
 */
export interface ILayerStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Check if Host
   */
  isNotHost?: boolean
}

/**
 * {@docCategory Layer}
 */
export interface ILayerStyles {
  /**
   * Style for the root element when fixed.
   */
  root?: IStyle
  /**
   * Style for the Fabric component.
   */
  content?: IStyle
}
