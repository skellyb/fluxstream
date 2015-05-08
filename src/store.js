const Rx = require('rx')
const Im = require('immutable')

class Store {
  constructor (key, core) {
    this._key = key
    this._core = core
    this._input = new Rx.Subject()
    this.observable = this._input.publish()
    this.observable.connect()

    const handlers = this.change()
    if (!handlers) return

    const actionNames = Object.keys(handlers)
    const actions = this._core.createActions(...actionNames)
    actionNames.forEach((name) => {
      actions[name].subscribe(this._handleAction.bind(this, handlers[name]))
    })
  }

  getInitialState () {
    return {}
  }

  change () {}

  shouldUpdate (updatedState, currentState) {
    return true
  }

  didUpdate (currentState) {}

  subscribe (valHandler, errHandler, completeHandler) {
    return this.observable.subscribe(valHandler, errHandler, completeHandler)
  }

  replaceState (state) {
    this._input.onNext(state)
  }

  _validateUpdate (updatedState, currentState) {
    return (updatedState !== undefined && this.shouldUpdate(updatedState, currentState))
  }

  _handleAction (handler, payload) {
    let currentState = this._core.get(this._key)
    if (Im.Iterable.isIterable(currentState)) {
      currentState = currentState.toJS()
    }

    const updatedState = handler(payload, currentState)

    if (this._validateUpdate(updatedState, currentState)) {
      this._input.onNext(updatedState)
    }
  }
}

module.exports = Store
