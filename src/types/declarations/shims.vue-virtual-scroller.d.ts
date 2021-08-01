// Type definitions for vue-virtual-scroller
// Project: https://github.com/Akryum/vue-virtual-scroller/
declare module 'vue-virtual-scroller' {
  import Vue, { Component, ComponentOptions, PluginObject } from 'vue'
  import { DefaultData, DefaultMethods } from 'vue/types/options'
  interface PluginOptions {
    installComponents?: boolean
    componentsPrefix?: string
  }

  const plugin: PluginObject<PluginOptions> & { version: string }

  export const RecycleScroller:
    | Component<
      Vue,
      DefaultData<Vue>,
      DefaultMethods<Vue>,
      DefaultMethods<Vue>,
      DefaultComputed,
      PropsDefinition<DefaultProps>,
      DefaultProps
    >
    | undefined
  export const DynamicScroller:
    | Component<
      Vue,
      DefaultData<Vue>,
      DefaultMethods<Vue>,
      DefaultMethods<Vue>,
      DefaultComputed,
      PropsDefinition<DefaultProps>,
      DefaultProps
    >
    | undefined
  export const DynamicScrollerItem:
    | Component<
      Vue,
      DefaultData<Vue>,
      DefaultMethods<Vue>,
      DefaultMethods<Vue>,
      DefaultComputed,
      PropsDefinition<DefaultProps>,
      DefaultProps
    >
    | undefined

  export function IdState(options?: { idProp?: (vm: any) => any }): ComponentOptions<Vue> | typeof Vue

  export default plugin
}
