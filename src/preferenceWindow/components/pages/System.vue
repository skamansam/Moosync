<template>
  <div>
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <div class="path-selector w-100">
          <CheckboxGroup
            title="System Settings"
            tooltip=""
            :isExtension="false"
            :defaultValue="checkboxValues"
            prefKey="system"
          />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import CheckboxGroup from '../CheckboxGroup.vue'

@Component({
  components: {
    CheckboxGroup
  }
})
export default class System extends Vue {
  get checkboxValues() {
    return [this.startupCheckbox, this.minimizeToTrayCheckbox]
  }

  get startupCheckbox() {
    return {
      key: 'startOnStartup',
      title: 'Start app on system startup',
      enabled: false
    }
  }

  get minimizeToTrayCheckbox() {
    return {
      key: 'minimizeToTray',
      title: 'Minimize to tray on close',
      enabled: true
    }
  }
}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left
</style>
