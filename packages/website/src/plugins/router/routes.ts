import { FabricComponents } from '@uifabric-vue/office-ui-fabric-vue'

const routes: any[] = []
for (const name in FabricComponents) {
  routes.push({
    name,
    path: `/${name}`,
    component: () => import(`@/pages/${name}/${name}.vue`),
    props: {},
  })
}
routes.push({
  name: 'Welcome',
  path: '/',
  component: () => import('@/Welcome.vue'),
  props: {},
})
routes.push({
  name: 'Button',
  path: '/Button',
  component: () => import('@/pages/Button/Button.vue'),
  props: {},
})
routes.push({
  name: 'BasicList',
  path: '/BasicList',
  component: () => import('@/pages/BasicList/BasicList.vue'),
  props: {},
})
routes.push({
  name: 'FileTypeIcons',
  path: '/FileTypeIcons',
  component: () => import('@/pages/FileTypeIcons/FileTypeIcons.vue'),
  props: {},
})

export default routes
