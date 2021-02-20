<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Sidebar extends Vue {
  created() {
    this.$router.replace('/albums/b26d7766-d9ea-4af7-8f9b-680d949f0103')
  }
}
</script>
