import Im from 'immutable'
import Action from './action'
import Rx from 'rx'

export default class Core {
  constructor (config = {}) {
    this._state = Im.Map({})
    this._stores = Im.Map({})
    this._actions = Im.Map({})

    if (config.actions) this.createActions(...config.actions)
    if (config.stores) this.createStores(config.stores)
  }

  createActions (...actionNames) {
    let newActions = Im.Map({})
    actionNames.forEach((name) => newActions = newActions.set(name, new Action()))
    this._actions = newActions.merge(this._actions)
    return this._actions.toObject()
  }

  createStores (storeMap) {
    const keys = Object.keys(storeMap)
    let newStores = Im.Map({})

    keys.forEach((key) => {
      const StoreDef = storeMap[key]
      const initStore = new StoreDef(key, this)
      newStores = newStores.set(key, initStore)

      this._updateState(key, initStore.getInitialState())

      initStore.observable.subscribe((updatedState) => this._updateState(key, updatedState))
    })

    this._stores = this._stores.merge(newStores)
  }

  get actions () {
    return this._actions.toObject()
  }

  get stores () {
    return this._stores.toObject()
  }

  get (keyPath) {
    const val = (Array.isArray(keyPath)) ? this._state.getIn(keyPath) : this._state.get(keyPath)
    return (Im.Iterable.isIterable(val)) ? val.toJS() : val
  }

  combineStores (...stores) {
    return Rx.Observable.merge(...this._getObservables('_stores', stores))
      .map(() => stores.map((name) => this.get(name)))
  }

  waitForStores (...stores) {
    return this._waitFor('_stores', stores)
  }

  waitForActions (...actions) {
    return this._waitFor('_actions', actions)
  }

  takeSnapshot () {
    return this._state.toJS()
  }

  restore (state) {
    const storeKeys = Object.keys(state)
    storeKeys.forEach((key) => {
      this._stores.get(key).replaceState(state[key])
    })
  }

  _waitFor (type, keys) {
    return Rx.Observable.just().flatMap(() => {
      return Rx.Observable.zipArray(...this._getObservables(type, keys))
    })
  }

  _getObservables (type, keys) {
    const storeKeys = (Array.isArray(keys)) ? keys : [keys]
    return storeKeys.map((name) => this[type].get(name).observable)
  }

  _updateState (name, data) {
    this._state = this._state.set(name, Im.fromJS(data))
  }
}
