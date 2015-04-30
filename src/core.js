const Im = require('immutable')
const Action = require('./action')
const Bacon = require('baconjs')

class Core {
  constructor (options) {
    const opts = options || {}
    this._state = Im.Map({})
    this._stores = Im.Map(opts.stores || {})
    this._actions = Im.Map(opts.actions || {})
  }

  createStores (...storeClasses) {
    let newStores = Im.Map({})

    storeClasses.forEach((Def) => {
      const initStore = new Def(this)
      const key = initStore.getKey()
      newStores = newStores.set(key, initStore)

      this._updateState(key, initStore.getInitialState())

      initStore.observe((updatedState) => {
        this._updateState(key, updatedState)
        initStore.didUpdate(this.get(key))
      })
    })

    this._stores = this._stores.merge(newStores)
    console.log(this._state)
  }

  addActions (...actionNames) {
    let newActions = Im.Map({})
    actionNames.forEach((name) => newActions = newActions.set(name, new Action()))
    this._actions = newActions.merge(this._actions)
    return this._actions.toObject()
  }

  get actions () {
    return this._actions.toObject()
  }

  get (keyPath) {
    return (Array.isArray(keyPath)) ? this._state.getIn(keyPath) : this._state.get(keyPath)
  }

  observe (...keyPathsAndHandler) {
    const { args: keyPaths, callback: handler } = this._parseArgsAndCallback(keyPathsAndHandler)
    const observeStream = Bacon.mergeAll(
      this._getStoreStreams(keyPaths)
    )

    return observeStream.onValue(() => {
      handler(...this._getStateFromPaths(keyPaths))
    })
  }

  // TODO: Name better: observeAll, waitFor or something
  zip (...keyPathsAndHandler) {
    const { args: keyPaths, callback: handler } = this._parseArgsAndCallback(keyPathsAndHandler)
    const zipStream = Bacon.zipAsArray(
      this._getStoreStreams(keyPaths)
    )

    return zipStream.onValue(() => {
      handler(...this._getStateFromPaths(keyPaths))
    })
  }

  takeSnapshot () {
    return this._state.toJS()
  }

  restore (state) {
    // TODO: Still needs to trigger observers
    this._state = Im.fromJS(state)
  }

  _parseArgsAndCallback (argsAndCB) {
    const args = argsAndCB.slice(0, -1)
    const callback = argsAndCB.pop()

    if (typeof callback !== 'function') throw new Error('No callback argument defined')

    return { args, callback }
  }

  _getStoreStreams (keyPaths) {
    return keyPaths.map((key) => {
      const storeKey = (Array.isArray(key)) ? key[0] : key
      return this._stores.get(storeKey).getStream()
    })
  }

  _getStateFromPaths (keyPaths) {
    return keyPaths.map((path) => {
      const pathArr = (Array.isArray(path)) ? path : [path]
      const val = this._state.getIn(pathArr)
      return (Im.Iterable.isIterable(val)) ? val.toJS() : val
    })
  }

  _updateState (name, data) {
    const update = {}
    update[name] = data
    const immutableUpdate = Im.fromJS(update)
    this._state = this._state.merge(immutableUpdate)
  }
}

module.exports = Core
