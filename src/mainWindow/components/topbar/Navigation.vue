<template>
  <b-row class="justify-content-between">
    <b-col cols="6" @click="back">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.24257 2.34317L7.82836 0.928955L0.757324 8.00001L7.82839 15.0711L9.24261 13.6569L3.58574 8L9.24257 2.34317Z"
          fill="var(--textPrimary)"
        />
      </svg>
    </b-col>
    <b-col cols="6" @click="forward">
      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.0859375 2.34317L1.50015 0.928955L8.57122 8.00002L1.50015 15.0711L0.0859375 13.6569L5.74279 8.00002L0.0859375 2.34317Z"
          fill="var(--textPrimary)"
        />
      </svg>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({})
export default class Notifications extends Vue {
  private forward() {
    this.$router.forward()
  }

  private back() {
    this.$router.back()
  }
}
</script>
