var test = require('tape');
var createStore = require('../lib/store').createStore;
var defineStore = require('../lib/store').defineStore;
var createAction = require('../lib/createAction');

test('Store Creator', function(t) {
    t.plan(7);

    var testAction = createAction();
    var store = createStore({
        config: {
            testProp: {
                action: testAction
            }
        }
    });
    testAction('Locked and loaded.');
    store.streams.testProp.listenOnce(function(payload) {
        t.equal(payload, 'Locked and loaded.', 'Property should retain values before listener is attached.');
    });
    

    testAction = createAction();
    store = createStore({
        init: function() {
            t.ok(this.streams.testProp, 'Store\'s properties should be configured before init() is called.');
        },

        config: {
            testProp: {
                action: testAction
            }
        }
    });


    var count = 0;
    testAction = createAction();
    store = createStore({
        config: {
            testProp: {
                action: testAction
            }
        }
    });
    store.streams.testProp.listenOnce(function() {
        count += 1;
    });
    testAction('first');
    testAction('second');
    t.equal(count, 1, 'Streaming prop\'s listenOnce should unsubscribe self.');


    var phrase = '';
    testAction = createAction();
    var testAction2 = createAction();
    store = createStore({
        config: {
            testProp: {
                action: testAction
            },
            testProp2: {
                action: testAction2
            }
        }
    });
    store.listen(function(payload) {
        phrase += payload;
    });
    testAction('Bring ');
    testAction2('together.');
    t.equal(phrase, 'Bring together.', 'All prop events should flow through main store stream.');


    var results;
    testAction = createAction();
    testAction2 = createAction();
    store = createStore({
        config: {
            testProp: {
                action: testAction
            },
            testProp2: {
                action: testAction2
            }
        }
    });
    store.combine([
        store.streams.testProp,
        store.streams.testProp2,
    ], function(payloads) {
        results = payloads;
        if (payloads.length < 1) t.fail('Payloads must be combined.');
    });
    testAction2('Part two.');
    testAction('Part one.');
    t.equal(results.length, 2, 'Combined properties should deliver to payloads at once.');
    t.equal(results[1], 'Part two.', 'Combined payloads should stay in order even if events fire out of order.');


    testAction = createAction(function(payload) {
        return payload !== 'fail';
    });
    store = createStore({
        config: {
            testProp: {
                action: testAction
            }
        }
    });
    store.errors(function(err) {
        t.equal(err, 'Bad payload', 'Errors in store\'s streaming props should flow into main stream.');
    });
    testAction('fail');
});

test('Store Definition', function(t) {
    t.plan(3);

    var optionsPassed;
    var StoreDef = defineStore({
        init: function(options) {
            optionsPassed = (options.isSet);
        }
    });
    t.equal(typeof StoreDef, 'function', 'defineStore returns a constructor function');

    var store = new StoreDef({ isSet: true });
    t.ok(store instanceof StoreDef, 'should be instance of the definition');
    t.ok(optionsPassed, 'Options passed into constructor should get passed into init()');
});