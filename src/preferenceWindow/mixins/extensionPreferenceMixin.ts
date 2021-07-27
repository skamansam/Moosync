import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export class ExtensionPreferenceMixin extends Vue {
  @Prop({ default: '' })
  public defaultValue!: any

  @Prop()
  public prefKey?: string

  public value: any = ''

  public loading = false

  mounted() {
    console.log(this.prefKey, this.defaultValue)
    if (this.prefKey) {
      this.loading = true
      window.PreferenceUtils.loadSelective(this.prefKey).then((val) => (this.value = val ?? this.defaultValue)).then(() => this.loading = false).then(() => console.log(this.value))
    }
  }

  public onInputChange() {
    this.prefKey && window.PreferenceUtils.saveSelective(this.prefKey, this.value)
  }
}
