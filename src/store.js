const Bacon = require('baconjs')
const Im = require('immutable')

class Store {
  constructor (core) {
    this._core = core
    this._stream = new Bacon.Bus()

    const handlers = this.getActionHandlers()
    const actionNames = Object.keys(handlers)
    const actions = this._core.addActions(...actionNames)
    actionNames.forEach((name) => {
      actions[name].observe(this._handleAction.bind(this, handlers[name]))
    })
  }

  getKey () {
    throw new Error('No key defined.')
  }

  getInitialState () {
    return {}
  }

  getActionHandlers () {
    throw new Error('No action handlers defined.')
  }

  shouldUpdate (updatedState, currentState) {
    return true
  }

  didUpdate (currentState) {}

  observe (callback) {
    return this._stream.onValue(callback)
  }

  getStream () {
    return this._stream
  }

  _validateUpdate (updatedState, currentState) {
    return (updatedState !== undefined && this.shouldUpdate(updatedState, currentState))
  }

  _handleAction (handler, payload) {
    let currentState = this._core.get(this.getKey())
    if (Im.Iterable.isIterable(currentState)) {
      currentState = currentState.toJS()
    }

    const updatedState = handler(payload, currentState)

    if (this._validateUpdate(updatedState, currentState)) {
      this._stream.push(updatedState)
    }
  }
}

module.exports = Store
