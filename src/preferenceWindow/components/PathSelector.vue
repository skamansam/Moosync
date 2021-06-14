<template>
  <b-container fluid class="path-container w-100">
    <b-row no-gutters>
      <b-col cols="auto" align-self="center" class="title d-flex">
        <div>Song Directories</div>
        <div class="ml-3">
          <Tooltip tooltipId="song-directories-tooltip" text="Directories where all your local music is stored" />
        </div>
      </b-col>
      <b-col cols="auto" align-self="center" class="new-directories ml-auto">
        <div class="add-directories-button" @click="openFileBrowser">Add New Directory...</div>
      </b-col>
    </b-row>
    <b-row no-gutters class="background w-100 mt-4 d-flex">
      <b-row no-gutters class="mt-3 item w-100" v-for="path in musicPaths" :key="path.path">
        <b-col cols="auto" align-self="center" class="ml-4">
          <b-checkbox @change="togglePath(path.path)" :id="`checkbox-${path.path}`" :checked="path.enabled" />
        </b-col>
        <b-col col md="8" lg="9" align-self="center" class="ml-3 justify-content-start">
          <div class="item-text text-truncate">{{ path.path }}</div>
        </b-col>
        <b-col cols="auto" align-self="center" class="ml-auto">
          <div class="remove-button w-100" @click="removePath(path.path)">Remove</div>
        </b-col>
      </b-row>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Tooltip from '@/commonComponents/Tooltip.vue'
import { vxm } from '@/preferenceWindow/store'
@Component({
  components: {
    Tooltip
  }
})
export default class PathSelector extends Vue {
  get musicPaths() {
    if (vxm.preferences.preferences) return vxm.preferences.preferences.musicPaths
    return []
  }
  private togglePath(path: string) {
    vxm.preferences.togglePath({
      path: path,
      value: (document.getElementById(`checkbox-${path}`) as HTMLInputElement).checked
    })
  }

  private removePath(path: string) {
    vxm.preferences.removePath(path)
    vxm.preferences.setPathsChanged(true)
  }

  private openFileBrowser() {
    window.WindowUtils.openFileBrowser().then((data) => {
      if (!data.canceled) {
        vxm.preferences.addPaths(...data.filePaths)
        vxm.preferences.setPathsChanged(true)
      }
    })
  }
}
</script>

<style lang="sass">
.custom-control-input:checked + .custom-control-label::before
  background-color: transparent
  border-color: white

.custom-control-input:indeterminate ~ .custom-control-label
  background-image: none
  box-shadow: none

.custom-control-input:focus ~ .custom-control-label::before
  outline: white !important
  border: 1px solid white !important
  box-shadow: 0 0 1px 1px #fff

.custom-control-label
  &::before
    background-color: transparent
</style>

<style lang="sass" scoped>
// .container
//   max-width: 720px
.title
  font-size: 26px

.new-directories
  font-size: 16px
  color: var(--accent)
  &:hover
    cursor: pointer

.add-directories-button
  user-select: none

.background
  align-content: flex-start
  background-color: var(--tertiary)
  height: 220px
  overflow-y: scroll
  overflow-x: hidden

  &::-webkit-scrollbar-track
    background: var(--tertiary)

.item
  height: 35px
  flex-wrap: nowrap

.item-text
  font-size: 18px
  color: var(--textSecondary)
  min-width: 0
  text-align: left

.remove-button
  color: #E62017
  user-select: none
  &:hover
    cursor: pointer
</style>
