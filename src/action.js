const Bacon = require('baconjs')

class Action {
  constructor () {
    const _dispatcher = new Bacon.Bus()
    const _func = (payload) => _dispatcher.push(payload)

    _func.getStream = () => _dispatcher

    _func.observe = (callback) => _dispatcher.onValue(callback)

    _func.once = (callback) => {
      return _dispatcher.onValue((payload) => {
        callback(payload)
        return Bacon.noMore
      })
    }

    return _func
  }
}

module.exports = Action
