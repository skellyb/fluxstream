import Rx from 'rx'
import Im from 'immutable'

export default class Store {
  constructor (key, core) {
    this._key = key
    this._core = core
    this._input = new Rx.Subject()
    this.observable = this._input.publish()
    this.observable.connect()

    const updaters = this.update()
    const handlers = this.handle()
    if (!updaters && !handlers) return

    if (updaters && typeof updaters === 'object') {
      Object.keys(updaters).forEach((name) => {
        if (!this._validateAction(name)) return
        this._core.actions[name].subscribe(this._handleAction.bind(this, updaters[name]))
      })  
    }

    if (handlers && typeof handlers === 'object') {
      Object.keys(handlers).forEach((name) => {
        if (!this._validateAction(name)) return
        this._core.actions[name].subscribe(handlers[name].bind(this, this._core))
      })
    }
  }

  getInitialState () {
    return {}
  }

  handle () {}

  update () {}

  shouldUpdate (updatedState, currentState) {
    return true
  }

  onUpdate (callback) {
    return this.observable.subscribe((updatedState) => callback({ [this._key]: updatedState }))
  }

  didUpdate (currentState) {}

  replaceState (state) {
    this._input.onNext(state)
  }

  _validateAction (name) {
    if (this._core.actions[name]) return true
    throw new Error(`No action named ${name}`)
  }

  _validateUpdate (updatedState, currentState) {
    return (updatedState !== undefined && this.shouldUpdate(updatedState, currentState))
  }

  _handleAction (handler, payload) {
    let currentState = this._core.get(this._key)
    if (Im.Iterable.isIterable(currentState)) {
      currentState = currentState.toJS()
    }

    const updatedState = handler(this._core, payload, currentState)

    if (this._validateUpdate(updatedState, currentState)) {
      this._input.onNext(updatedState)
    }
  }
}
