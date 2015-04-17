const test = require('tape')
const Bacon = require('baconjs')
const Store = require('../lib/store.js')

const mockCore = {
  get: function (key) {
    return { key: 'value' }
  },

  addActions: function (names) {
    const dispatcher = new Bacon.Bus()
    const func = (payload) => dispatcher.push(payload)
    func.observe = (callback) => dispatcher.onValue(callback)
    mockCore.actions = {
      testAction: func
    }
    return { testAction: func }
  }
}

class TestStore extends Store {
  getKey () {
    return 'tester'
  }

  getInitialState () {
    return { key: 'value' }
  }

  getActionHandlers () {
    return {
      testAction: (payload, state) => {
        const update = state
        update.key = payload
        return update
      }
    }
  }

  shouldUpdate (updated, current) {
    return updated.key !== 'Wrong value'
  }
}

class NoActionStore extends Store {}

class NoKeyStore extends Store {
  getActionHandlers () {
    return {
      testAction: (payload, state) => payload
    }
  }
}

test('Stores', function (t) {
  t.plan(3)

  let store = new TestStore(mockCore)
  store.observe((updatedState) => {
    t.equal(updatedState.key, 'New value', 'Changes to state are observable')
  })
  mockCore.actions.testAction('New value')

  t.throws(NoActionStore.bind(this, mockCore), 'Error thrown if no action handlers are defined')

  store = new NoKeyStore(mockCore)
  t.throws(NoKeyStore.getKey, 'Error thrown if no key defined')

  store = new TestStore(mockCore)
  store.observe((updatedState) => {
    t.fail('shouldUpdate() should prevent this change from happening')
  })
  mockCore.actions.testAction('Wrong value')

})
