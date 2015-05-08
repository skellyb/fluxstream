const test = require('tape')
const Action = require('../lib/action.js')

test('Actions', function (t) {
  t.plan(3)

  let action = new Action()
  let subscription = action.subscribe((payload) => t.equal(payload, 'Test Data', 'Payload should flow to listeners'))
  action('Test Data')
  subscription.dispose()

  let callCount = 0
  action = new Action()
  action.once((payload) => callCount = callCount + 1)
  action('Once')
  action('Twice')
  t.equal(callCount, 1, 'once() unsubscribes self')

  action = new Action()
  action.observable
    .filter((payload) => {
      return payload === 'RxJS'
    })
    .subscribe((payload) => {
      t.equal(payload, 'RxJS', 'rx property gives access to RxJS observable and all of its methods')
    })
  action('RxJS')

})
