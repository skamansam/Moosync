import merge from 'deepmerge'
import { Store } from 'vuex'
import * as shvl from 'shvl'

export function createPersist(paths: string[]) {
  return (store: Store<any>) => {
    setInitialState(store).then(() => {
      store.subscribe((mutation, state) => {
        setState('persisted', reducer(state, paths))
      })
    })
  }
}

function reducer(state: Object, paths: string[]) {
  return Array.isArray(paths)
    ? paths.reduce(function (substate, path) {
      return shvl.set(substate, path, shvl.get(state, path))
    }, {})
    : state
}

async function setInitialState(store: Store<any>) {
  const savedState = await window.Store.get('persisted')
  if (savedState) {
    const parsed = JSON.parse(savedState)
    store.replaceState(
      merge(store.state, parsed, {
        arrayMerge: (_, saved) => saved,
        clone: false,
      })
    )
  }
}

async function setState(key: string, state: any) {
  await window.Store.set(key, JSON.stringify(state))
}
