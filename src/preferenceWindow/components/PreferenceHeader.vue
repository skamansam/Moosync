<template>
  <b-row no-gutters>
    <b-col cols="auto" align-self="center" class="title d-flex">
      <div>{{ title }}</div>
      <div class="ml-3">
        <Tooltip tooltipId="song-directories-tooltip" :text="tooltip" />
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import Tooltip from '@/commonComponents/Tooltip.vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: { Tooltip }
})
export default class PreferenceHeader extends Vue {
  @Prop()
  private title!: string

  @Prop()
  private tooltip!: string
}
</script>
