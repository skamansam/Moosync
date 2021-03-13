<!-- Copyright © 2018, Wuild Released under the MIT license. -->
<template>
  <div class="titlebar titlebar-style-dark">
    <div class="titlebar-resize-handle top"></div>
    <div class="titlebar-resize-handle right"></div>
    <div class="titlebar-resize-handle left"></div>
    <div class="titlebar-header">
      <div class="titlebar-icon">
        <slot name="icon"></slot>
      </div>

      <div class="titlebar-name">
        <slot name="title"></slot>
      </div>
    </div>

    <div class="titlebar-buttons">
      <button aria-label="minimize" title="Minimize" tabindex="-1" @click="onMinimize()">
        <svg aria-hidden="true" version="1.1" width="10" height="10">
          <path d="M 0,5 10,5 10,6 0,6 Z"></path>
        </svg>
      </button>

      <button aria-label="maximize" title="Maximize" tabindex="-1" @click="onMaximize()">
        <svg aria-hidden="true" version="1.1" width="10" height="10">
          <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z"></path>
        </svg>
      </button>

      <button aria-label="close" title="Close" tabindex="-1" class="close" @click="onClose()">
        <svg aria-hidden="true" version="1.1" width="10" height="10">
          <path
            d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component({})
export default class Sidebar extends Vue {
  @Prop({ default: 'main-window' })
  private windowType!: 'main-window' | 'preference-window'

  private onMinimize() {
    this.windowType == 'main-window' ? window.WindowUtils.minMainWindow() : window.WindowUtils.minPreferenceWindow()
  }
  private onMaximize() {
    this.windowType == 'main-window' ? window.WindowUtils.maxMainWindow() : window.WindowUtils.maxPreferenceWindow()
  }
  private onClose() {
    this.windowType == 'main-window' ? window.WindowUtils.closeMainWindow() : window.WindowUtils.closePreferenceWindow()
  }
}
</script>

<style lang="scss" scoped>
.titlebar {
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  width: 100%;
  height: 18px;
  margin-top: 4px;
  -webkit-app-region: drag;

  .titlebar-style-dark {
    color: #fff;
    background: #2d3135;
  }
  &.titlebar-style-light {
    color: #2c2c2c;
    background: #f6f6f6;
  }
  .titlebar-resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    -webkit-app-region: no-drag;
    &.top {
      width: 100%;
      height: 3px;
    }
    &.right {
      left: auto;
      right: 0;
      width: 3px;
      height: 18px;
    }
    &.left {
      width: 3px;
      height: 18px;
    }
  }
  .titlebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .titlebar-icon,
  .titlebar-name {
    display: flex;
    align-content: center;
    align-self: center;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 18px;
    padding: 0 12px;
    height: 18px;
    > svg,
    > img {
      display: block;
      align-content: center;
      align-self: center;
      width: auto;
      height: 16px;
    }
  }
  .titlebar-icon ~ .titlebar-name {
    padding-left: 0;
  }
  .titlebar-buttons {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    margin-left: auto;
    button {
      -webkit-app-region: no-drag;
      display: inline-block;
      position: relative;
      width: 45px;
      height: 100%;
      padding: 0;
      margin: 0;
      overflow: hidden;
      border: none;
      box-shadow: none;
      border-radius: 0;
      color: currentColor;
      background-color: transparent;
      line-height: 10px;
      outline: none;
      svg {
        fill: currentColor;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
        color: currentColor;
      }
      &.close:hover {
        background-color: #e81123;
        color: #fff;
      }
    }
  }
}
</style>
