const test = require('tape')
const Action = require('../lib/action.js')

test('Actions', function (t) {
  t.plan(3)

  let action = new Action()
  let unsub = action.observe((payload) => t.equal(payload, 'Test Data', 'Payload should flow to listeners.'))
  action('Test Data')
  unsub()

  let callCount = 0
  action = new Action()
  action.once((payload) => callCount = callCount + 1)
  action('Once')
  action('Twice')
  t.equal(callCount, 1, 'once() unsubscribes self')

  action = new Action()
  action.stream().onValue((payload) => {
    t.equal(payload, 'Bacon', 'stream() returns a Bacon.js EventStream')
  })
  action('Bacon')
})
