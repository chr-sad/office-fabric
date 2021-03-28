import { Prop, Component, InjectReactive } from 'vue-property-decorator'
import { IProcessedStyleSet } from '@uifabric/merge-styles'
import { css, Async, IDisposable, EventGroup } from '@uifabric-vue/utilities'
import Vue from 'vue'
import { getTheme, ITheme, registerOnThemeChangeCallback } from '@uifabric/styling'

// @ts-ignore
@Component
export default abstract class BaseComponent<TProps = {}, TState = {}> extends Vue {
  $props!: TProps

  @Prop({ type: [String, Array], default: '' }) readonly className!: string
  @Prop({ type: [Object, Function], default: () => {} }) readonly styles!: any

  componentRef: HTMLElement | null = null
  css = css

  private __async: Async | null = null;
  private __events: EventGroup | null = null;
  private __disposables: IDisposable[] | null = null;

  protected state: TState = {} as TState
  protected props: TProps = {} as TProps

  theme = getTheme()

  created () {
    registerOnThemeChangeCallback(theme => {
      this.theme = theme
    })
  }

  /**
   * When the component has mounted, update the componentRef.
   */
  mounted () {
    this.componentRef = this.$el as HTMLElement
  }

  /**
   * If we have disposables, dispose them automatically on unmount.
   */
  beforeDestroy () {
    if (this.__disposables) {
      for (let i = 0, len = this._disposables.length; i < len; i++) {
        const disposable = this.__disposables[i]

        if (disposable.dispose) {
          disposable.dispose()
        }
      }
      this.__disposables = null
    }
  }

  protected get uid (): number {
    // @ts-ignore
    return this._uid
  }

  protected get classNames (): IProcessedStyleSet<any> {
    return {} as any
  }

  /**
   * Allows subclasses to push things to this._disposables to be auto disposed.
   */
  protected get _disposables (): IDisposable[] {
    if (!this.__disposables) {
      this.__disposables = []
    }
    return this.__disposables
  }

  /**
   * Gets the async instance associated with the component, created on demand. The async instance gives
   * subclasses a way to execute setTimeout/setInterval async calls safely, where the callbacks
   * will be cleared/ignored automatically after unmounting. The helpers within the async object also
   * preserve the this pointer so that you don't need to "bind" the callbacks.
   */
  protected get _async (): Async {
    if (!this.__async) {
      this.__async = new Async(this)
      this._disposables.push(this.__async)
    }

    return this.__async
  }

  /**
   * Gets the event group instance assocaited with the component, created on demand. The event instance
   * provides on/off methods for listening to DOM (or regular javascript object) events. The event callbacks
   * will be automatically disconnected after unmounting. The helpers within the events object also
   * preserve the this reference so that you don't need to "bind" the callbacks.
   */
  protected get events (): EventGroup {
    if (!this.__events) {
      this.__events = new EventGroup(this)
      this._disposables.push(this.__events)
    }

    return this.__events
  }

  /**
   * Updates the component's current state.
   *
   * @returns The updated state object.
   */
  protected setState (newState: TState): TState {
    for (const key in newState) {
      this.$set(this.state as any, key, newState[key])
    }
    return this.state
  }
}
