const Rx = require('rx')

class Action {
  constructor () {
    const input = new Rx.Subject()
    const dispatcher = input.publish()
    const actionFunc = (payload) => input.onNext(payload)

    dispatcher.connect()

    actionFunc.observable = dispatcher

    actionFunc.subscribe = (valHandler, errHandler, completeHandler) => {
      return dispatcher.subscribe(valHandler, errHandler, completeHandler)
    }

    actionFunc.once = (valHandler, errHandler, completeHandler) => {
      return dispatcher
        .take(1)
        .subscribe(valHandler, errHandler, completeHandler)
    }

    return actionFunc
  }
}

module.exports = Action
