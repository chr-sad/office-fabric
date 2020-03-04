import Fabric from './plugin/office-fabric'
import * as Components from './components'

export * from './utilities/positioning'
export * from './components'
export {
  Fabric,
  Components as FabricComponents,
}
export { loadTheme } from './plugin/office-fabric'
export { initializeIcons } from '@uifabric/icons'

export { IPartialTheme, IOptions } from './plugin/office-fabric'

export default Fabric
