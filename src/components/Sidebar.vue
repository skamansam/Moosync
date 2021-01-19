<template>
  <b-sidebar width="261px" visible id="sidebar" no-header-close sidebar-class="gradient">
    <template #header>
      <div class="d-flex w-100 mt-3 justify-content-between">
        <Toggle />
        <Rooms />
      </div>
    </template>
    <template #default
      ><div class="extra-margin-top"><Tabs /></div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Toggle from './sidebar/Toggle.vue'
import Rooms from './sidebar/Rooms.vue'
import Tabs from './sidebar/Tabs.vue'

@Component({
  components: {
    Toggle,
    Rooms,
    Tabs,
  },
})
export default class Sidebar extends Vue {}
</script>

<style lang="sass">
.gradient
  background: linear-gradient(176.27deg, #282828 1.69%, #212121 72.01%)
  border-radius: 0px 30px 0px 0px
</style>

<style lang="sass" scoped>
.sidebar
  position: absolute

.sidebar-item
  font-family: 'Proxima Nova'

.icon-spacing
  margin-right: 26px
  padding-left: 6px

.extra-margin-top
  margin-top: 1rem
</style>
