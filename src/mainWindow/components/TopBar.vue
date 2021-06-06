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
              <b-button @click="loginYoutube">{{
                youtubeName ? youtubeName : "YT Login"
              }}</b-button>
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
import { Youtube } from "@/utils/providers/youtube";

@Component({
  components: {
    Search,
    Navigation,
    Rooms,
  },
})
export default class TopBar extends mixins(Colors) {
  private youtube = new Youtube();
  private youtubeName = "";

  mounted() {
    this.getUserDetails();
  }

  private getUserDetails() {
    this.youtube
      .getUserDetails()
      .then((resp) => {
        if (resp && resp.items.length > 0) {
          console.log(resp);
          this.youtubeName = resp.items[0].snippet!.title;
        }
      })
      .catch((err) => console.log(err));
  }

  private async loginYoutube() {
    await this.youtube.login();
    this.getUserDetails();
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
