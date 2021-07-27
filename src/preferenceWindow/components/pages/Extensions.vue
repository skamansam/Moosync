<template>
  <div>
    <b-container fluid class="pref-container">
      <b-row no-gutters class="w-100">
        <b-col>
          <div class="add-extension-button" @click="openFileBrowser">Add New Directory...</div>
          <div v-for="ext of extensions" :key="`ext-${ext.packageName}`">{{ ext }}</div>
        </b-col>
      </b-row>
      <b-row v-for="ext of extensions" :key="ext.packageName" class="w-100">
        <b-container fluid>
          <b-row v-if="ext.preferences.length > 0" no-gutters class="w-100">
            <div class="w-100">
              <h2>{{ ext.name }}</h2>
              <div v-for="pref of ext.preferences" :key="pref.key">
                <component
                  v-if="isComponentExists(pref.type)"
                  :title="pref.title"
                  :tooltip="pref.description"
                  :prefKey="`${ext.packageName}.${pref.key}`"
                  :defaultValue="pref.default ? pref.default : pref.items"
                  :is="pref.type"
                />
              </div>
            </div>
          </b-row>
        </b-container>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import EditText from '../EditText.vue'
import DirectoryGroup from '../DirectoryGroup.vue'
import FilePicker from '../FilePicker.vue'
import CheckboxGroup from '../CheckboxGroup.vue'

@Component({
  components: {
    EditText,
    DirectoryGroup,
    FilePicker,
    CheckboxGroup
  }
})
export default class Extensions extends Vue {
  private extensions: ExtensionDetails[] = []

  created() {
    this.fetchExtensions()
  }

  private isComponentExists(type: string) {
    if (this.$options.components) return !!this.$options.components[type]
    return false
  }

  private openFileBrowser() {
    window.WindowUtils.openFileBrowser(true).then((data) => {
      if (!data.canceled) {
        window.ExtensionUtils.install(...data.filePaths).then((result) => {
          if (result.success) {
            Vue.nextTick().then(() => this.fetchExtensions())
          }
        })
      }
    })
  }

  private async fetchExtensions() {
    this.extensions = await window.ExtensionUtils.getAllExtensions()
  }
}
</script>

<style lang="sass" scoped>
*
  text-align: left
.pref-container
  max-width: 750px
  margin-left: 0 !important

.add-extension-button
  font-size: 22px
  color: var(--textPrimary)
</style>
