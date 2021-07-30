import { Component, Prop, Vue } from 'vue-property-decorator';

import { v1 } from 'uuid';

@Component
export class ExtensionPreferenceMixin extends Vue {
  @Prop({ default: '' })
  public defaultValue!: any

  @Prop()
  public prefKey?: string

  @Prop({ default: false })
  public isExtension!: boolean

  @Prop({ default: v1() })
  public packageName!: string

  public value: any = ''

  public loading = false

  mounted() {
    if (this.prefKey) {
      this.loading = true
      window.PreferenceUtils.loadSelective(this.prefKey, this.isExtension).then((val) => (this.value = val ?? this.defaultValue)).then(() => this.loading = false).then(() => console.log(this.value))
    }
  }

  public onInputChange() {
    this.prefKey && window.PreferenceUtils.saveSelective(this.prefKey, this.value, this.isExtension)

    if (this.isExtension) window.ExtensionUtils.sendEvent({ data: { key: this.prefKey, value: this.value }, type: 'onPreferenceChanged', packageName: this.packageName } as extensionEventMessage)
  }
}
