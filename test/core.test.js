const test = require('tape')
const Core = require('../lib/core.js')
const Store = require('../lib/store.js')

class TestStore extends Store {
  getKey () {
    return 'test'
  }

  getInitialState () {
    return 'Initial state'
  }

  getActionHandlers () {
    return {
      testAction: (payload, state) => payload
    }
  }
}

class TwoTestStore extends Store {
  getKey () {
    return 'twoTest'
  }

  getInitialState () {
    return { prop: 'two' }
  }

  getActionHandlers () {
    return {
      update: (payload, state) => {
        state.prop = payload
        return state
      }
    }
  }
}

test('Core', function (t) {
  t.plan(11)

  let core = new Core()
  t.ok(core instanceof Core, 'Instantiated core')

  core = new Core()
  core.createStores(TestStore)
  let firstValue = core.get('test')
  t.equal(firstValue, 'Initial state', 'Creating new store sets up initial state')

  core.actions.testAction('New state')
  let secondValue = core.get('test')
  t.equal(secondValue, 'New state', 'State is updated after stores action is called')

  core = new Core()
  core.addActions('testIt')
  core.actions.testIt.observe((payload) => {
    t.ok(payload, 'addActions creates an observable action')
  })
  core.actions.testIt(true)

  core = new Core()
  core.createStores(TestStore, TwoTestStore)
  core.observe('twoTest', (state) => t.equal(state.prop, 'three', 'setup single key observer and recieve latest state'))
  core.actions.update('three')

  core = new Core()
  core.createStores(TestStore, TwoTestStore)
  core.observe('test', ['twoTest', 'prop'], (firstState, secondState) => {
    t.equal(firstState, 'Initial state', 'State is sent to handler when any stores are listened to')
    t.equal(secondState, 'three', 'If keypath is included, it will receive nested state')
  })
  core.actions.update('three')

  core = new Core()
  core.createStores(TestStore, TwoTestStore)
  core.zip('test', 'twoTest', (firstState, secondState) => {
    t.equal(firstState, 'two events', 'State is sent to handler once all stores have have triggered a change')
    t.equal(secondState.prop, 'one event', 'Make sure handler isn\'t called until both stores have changed')
  })
  core.actions.update('one event')
  core.actions.testAction('two events')

  core = new Core()
  core.createStores(TestStore)
  core.actions.testAction('snapshot')
  let currentState = core.takeSnapshot()
  t.equal(currentState.test, 'snapshot', 'Retrieve a snapshot of current app state')

  core = new Core()
  core.createStores(TestStore)
  core.restore({ test: 'Restored state' })
  let restoreValue = core.get('test')
  t.equal(restoreValue, 'Restored state', 'Restore state from object')
})
