const test = require('tape')
const Store = require('../lib/store.js')
const Core = require('../lib/core.js')

class TestStore extends Store {
  getInitialState () {
    return 'init'
  }

  change () {
    return {
      testAction: (payload, state) => payload
    }
  }

  shouldUpdate (updated, current) {
    return updated !== 'Wrong value'
  }
}

test('Stores', function (t) {
  t.plan(3)

  let core = new Core()
  core.createStores({ tester: TestStore })
  t.equal(core.get('tester'), 'init', 'Initial state is set')

  core = new Core()
  core.createStores({ tester: TestStore })
  core.stores.tester.subscribe((updatedState) => {
    t.equal(updatedState, 'New value', 'Changes to state are observable')
  })
  core.actions.testAction('New value')

  core = new Core()
  core.createStores({ tester: TestStore })
  core.stores.tester.subscribe((updatedState) => {
    t.fail('shouldUpdate() should prevent this change from happening')
  })
  core.actions.testAction('Wrong value')

  core = new Core()
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
})
