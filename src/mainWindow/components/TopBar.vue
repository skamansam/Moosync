<template>
  <div class="topbar-container d-flex align-items-center">
    <b-container fluid class="d-flex">
      <b-row class="flex-grow-1 justify-content-start">
        <b-col cols="9">
          <Search />
        </b-col>
        <b-col cols="auto" class="my-auto">
          <Navigation />
        </b-col>
        <b-col align-self="center">
          <Rooms id="account" class="accounts-icon" />
          <b-popover :target="`account`" placement="bottom" triggers="focus">
            <div>
              <b-button @click="loginYoutube">YT Login</b-button>
            </div>
          </b-popover>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Navigation from "@/mainWindow/components/topbar/Navigation.vue";
import Search from "@/mainWindow/components/topbar/Search.vue";
import Colors from "@/utils/mixins/Colors";
import { mixins } from "vue-class-component";
import { Component } from "vue-property-decorator";
import Rooms from "@/mainWindow/components/icons/Rooms.vue";
import { AuthFlow, AuthStateEmitter } from "@/utils/oauth/flow";

@Component({
  components: {
    Search,
    Navigation,
    Rooms,
  },
})
export default class TopBar extends mixins(Colors) {
  private authFlow: AuthFlow = new AuthFlow();

  private async loginYoutube() {
    this.authFlow.authStateEmitter.on(AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
      console.log("got resp");
    });

    // await window.ProviderUtils.login();
    if (!this.authFlow.loggedIn()) {
      return this.authFlow
        .fetchServiceConfiguration()
        .then(() => this.authFlow.makeAuthorizationRequest());
    } else {
      console.log("logged in");
      return Promise.resolve();
    }
  }
}
</script>

<style lang="sass" scoped>
.topbar-container
  background: var(--primary)
  height: 70px

.accounts-icon
  margin-top: 5px
</style>
