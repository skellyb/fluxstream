const test = require('tape')
const Store = require('../lib/store.js')
const Core = require('../lib/core.js')

class TestStore extends Store {
  getInitialState () {
    return 'init'
  }

  handle () {
    return {
      noChange: (core, payload) => payload.pass('Store handled action')
    }
  }

  update () {
    return {
      testAction: (core, payload, state) => payload
    }
  }

  shouldUpdate (updated, current) {
    return updated !== 'Wrong value'
  }
}

test('Stores', function (t) {
  t.plan(4)

  let core = new Core()
  core.createActions('testAction', 'noChange')
  core.createStores({ tester: TestStore })
  t.equal(core.get('tester'), 'init', 'Initial state is set')

  core = new Core()
  core.createActions('testAction', 'noChange')
  core.createStores({ tester: TestStore })
  core.stores.tester.onUpdate((state) => {
    t.equal(state.tester, 'New value', 'Changes to state are observable')
  })
  core.actions.testAction('New value')

  core = new Core()
  core.createActions('testAction', 'noChange')
  core.createStores({ tester: TestStore })
  core.stores.tester.onUpdate((state) => {
    t.fail('shouldUpdate() should prevent this change from happening')
  })
  core.actions.testAction('Wrong value')

  core = new Core()
  core.createActions('testAction', 'noChange')
  core.createStores({ tester: TestStore })
  core.stores.tester
    .observable
    .map((state) => {
      return state + ' mapped?'
    })
    .subscribe((value) => {
      t.equal(value, 'Is it mapped?', 'Test store.observable provides an RxJS observable')
    })
  core.actions.testAction('Is it')

  core = new Core()
  core.createActions('testAction', 'noChange')
  core.createStores({ tester: TestStore })
  core.stores.tester.onUpdate((state) => t.fail('No change should be made from action in store.handle'))
  core.actions.noChange(t)
})
