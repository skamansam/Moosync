<template>
  <div>
    <button v-on:click="toggleBroadcaster()">Broadcaster</button>
    <button v-on:click="toggleWatcher()">Watcher</button>
    <Broadcaster v-if="!watcher"></Broadcaster>
    <Watcher v-if="watcher"></Watcher>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Broadcaster from '@/components/Broadcaster.vue'
import Watcher from '@/components/Watcher.vue'

@Component({
  components: {
    Broadcaster,
    Watcher,
  },
})
export default class MainComponent extends Vue {
  private watcher: Boolean = true
  public toggleWatcher() {
    this.watcher = true
  }
  public toggleBroadcaster() {
    this.watcher = false
  }
}
</script>
