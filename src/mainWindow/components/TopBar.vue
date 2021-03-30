<template>
  <div class="topbar-container d-flex align-items-center">
    <b-container fluid class="d-flex">
      <b-row class="flex-grow-1 justify-content-start">
        <b-col cols="9"> <Search /> </b-col>
        <b-col cols="auto" class="my-auto"> <Navigation /> </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Navigation from '@/mainWindow/components/topbar/Navigation.vue'
import Search from '@/mainWindow/components/topbar/Search.vue'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component } from 'vue-property-decorator'

@Component({
  components: {
    Search,
    Navigation,
  },
})
export default class TopBar extends mixins(Colors) {}
</script>

<style lang="sass" scoped>
.topbar-container
  background: var(--primary)
  height: 70px
</style>
