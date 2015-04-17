const Bacon = require('baconjs')

class Store {
  constructor (core) {
    this._core = core
    this._stream = new Bacon.Bus()

    const handlers = this.getActionHandlers()
    const actionNames = Object.keys(handlers)
    const actions = this._core.addActions(actionNames)
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

  _validateUpdate (updatedState, currentState) {
    return (updatedState !== undefined && this.shouldUpdate(updatedState, currentState))
  }

  _handleAction (handler, payload) {
    const currentState = this._core.get(this.getKey())
    const updatedState = handler(payload, currentState)

    if (this._validateUpdate(updatedState, currentState)) {
      this._stream.push(updatedState)
    }
  }
}

module.exports = Store
