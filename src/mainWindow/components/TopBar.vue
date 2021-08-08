<template>
  <div class="topbar-container d-flex align-items-center">
    <b-container fluid class="d-flex">
      <b-row class="flex-grow-1 justify-content-start">
        <b-col>
          <Search />
        </b-col>
        <b-col cols="4" xl="3" class="my-auto d-flex">
          <Navigation class="mr-4" />
          <Notifications class="mr-4" />
          <Accounts class="mr-4" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Navigation from '@/mainWindow/components/topbar/Navigation.vue'
import Search from '@/mainWindow/components/topbar/Search.vue'
import { Component, Vue } from 'vue-property-decorator'
import Accounts from '@/mainWindow/components/topbar/Accounts.vue'
import Notifications from '@/mainWindow/components/topbar/Notifications.vue'

@Component({
  components: {
    Search,
    Navigation,
    Accounts,
    Notifications
  }
})
export default class TopBar extends Vue {}
</script>

<style lang="sass" scoped>

.topbar-container
  background: var(--primary)
  height: 70px
</style>
