const test = require('tape')
const Core = require('../lib/core.js')
const Store = require('../lib/store.js')

class TestStore extends Store {
  getInitialState () {
    return 'Initial state'
  }

  update () {
    return {
      testAction: (payload, state) => payload
    }
  }
}

class TwoTestStore extends Store {
  getInitialState () {
    return { prop: 'two' }
  }

  update () {
    return {
      update: (payload, state) => {
        state.prop = payload
        return state
      }
    }
  }
}

test('Core', function (t) {
  t.plan(15)

  let core = new Core()
  t.ok(core instanceof Core, 'Instantiated core')

  core = new Core()
  core.createStores({ test: TestStore })
  let firstValue = core.get('test')
  t.equal(firstValue, 'Initial state', 'Creating new store sets up initial state')

  core.actions.testAction('New state')
  let secondValue = core.get('test')
  t.equal(secondValue, 'New state', 'State is updated after stores action is called')

  core = new Core()
  core.createActions('testIt')
  core.actions.testIt.subscribe((payload) => {
    t.ok(payload, 'addActions creates an observable action')
  })
  core.actions.testIt(true)

  core = new Core()
  core.createStores({ test: TestStore, twoTest: TwoTestStore })
  core.stores.twoTest.onUpdate((state) => t.equal(state.twoTest.prop, 'three', 'setup single key observer and recieve latest state'))
  core.actions.update('three')

  core = new Core()
  core.createStores({ test: TestStore, twoTest: TwoTestStore })
  core
    .combineStores('test', 'twoTest')
    .take(1)
    .subscribe((payloads) => {
      t.equal(payloads[0], 'Initial state', 'State is sent to handler when any store triggers a change')
      t.equal(payloads[1].prop, 'Update to 2nd store', 'State values are delivered in same order as combine arguments')
    })
  core.actions.update('Update to 2nd store')

  core = new Core()
  core.createActions('one', 'two')
  core
    .waitForActions('one', 'two')
    .take(1)
    .subscribe((payloads) => {
      t.equal(payloads[0], '1', 'waitForActions creates an observable stream that only emit events when all actions have been called')
      t.equal(payloads[1], '2', 'the payloads are passed in an array, same order as waitForActions arguments')
    })
  core.actions.one('1')
  core.actions.two('2')

  core = new Core()
  core.createStores({ test: TestStore, twoTest: TwoTestStore })
  core
    .waitForStores('test', 'twoTest')
    .subscribe((payloads) => {
      t.equal(payloads[0], 'test event', 'State is sent to handler once all stores have have triggered a change')
      t.equal(payloads[1].prop, 'twotest event', 'Make sure handler isn\'t called until both stores have changed')
    })
  core.actions.update('twotest event')
  core.actions.testAction('test event')

  core = new Core()
  core.createStores({ test: TestStore })
  core.actions.testAction('snapshot')
  let currentState = core.takeSnapshot()
  t.equal(currentState.test, 'snapshot', 'Retrieve a snapshot of current app state')

  core = new Core()
  core.createStores({ test: TestStore })
  core.restore({ test: 'Restored state' })
  let restoreValue = core.get('test')
  t.equal(restoreValue, 'Restored state', 'Restore state from object')

  core = new Core({
    stores: {
      test: TestStore
    },
    actions: ['go']
  })
  core.actions.go.subscribe((payload) => t.equal(payload, 'action', 'Action setup via constructor options'))
  core.stores.test.onUpdate((state) => t.equal(state.test, 'store', 'Store setup via constructor options'))
  core.actions.go('action')
  core.actions.testAction('store')

})
