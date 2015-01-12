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

test('Bad store config', function(t) {
    t.plan(2);

    (function(){
        console.warn = function (message) {
            t.ok(message, 'Warning thrown if undefined action is used in store config.');
        };

        var noAction;
        var store = createStore({
            config: {
                testProp: {
                    action: noAction
                }
            }
        });

        t.equal(store.streams.testProp, undefined, 'Streaming prop should not be configured if undefined action used');
    })();
});

test('Store input stream and caching', function(t) {
    t.plan(7);

    // Test input handler
    var fetchAction = createAction();
    var receiveAction = createAction();
    var store = createStore({
        config: {
            testProp: {
                action: receiveAction,
                inputAction: fetchAction,
                inputHandler: function(payload) {
                    receiveAction('All done.');
                }
            }
        }
    });

    fetchAction();
    store.streams.testProp.listen(function(payload) {
        t.equal(payload, 'All done.', 'Store should handle input action.');
    });

    // Test cache
    var data = {
        obj1: {
            id: 'obj1',
            value: 'Into the cache.'
        }, 
        obj2: {
            id: 'obj2',
            value: 'Returned in a dash.'
        }
    };

    fetchAction = createAction();
    receiveAction = createAction();
    store = createStore({
        config: {
            testProp: {
                action: receiveAction,
                init: { id: 'default', value: 'Nothing to see here.' },
                inputAction: fetchAction,
                inputHandler: function(payload) {
                    receiveAction( data[payload.name] );
                },
                cacheKey: 'id',
                inputKey: 'name'
            }
        }
    });

    var results = [];
    fetchAction({ name: 'obj1' });
    store.streams.testProp.listen(function(payload) {
        results.push(payload.value);
    });
    fetchAction({ name: 'obj2' });
    
    // mutate data to mock fetched update
    data = {
        obj1: {
            id: 'obj1',
            value: 'Update in a flash.'
        }
    };

    fetchAction({ name: 'obj1' });

    t.equal(results[0], 'Into the cache.', 'Prop returns current value.');
    t.equal(results[1], 'Nothing to see here.', 'After fetching different item, initial result is default (init) value.');
    t.equal(results[2], 'Returned in a dash.', 'Then fetch completes with requested value.');
    t.equal(results[3], 'Into the cache.', 'Fetching a cached value returns cache right away.');
    t.equal(results[4], 'Update in a flash.', 'Finally, fetch sends updated value');


    // Test cache limit
    var data = {
        obj1: {
            id: 'obj1',
            value: 'Into the cache.'
        }, 
        obj2: {
            id: 'obj2',
            value: 'Returned in a dash.'
        },
        obj3: {
            id: 'obj3',
            value: 'One too many.'
        }
    };

    fetchAction = createAction();
    receiveAction = createAction();
    store = createStore({
        config: {
            testProp: {
                action: receiveAction,
                init: { id: 'default', value: 'Nothing to see here.' },
                inputAction: fetchAction,
                inputHandler: function(payload) {
                    receiveAction( data[payload] );
                },
                cacheKey: 'id',
                cacheLimit: 2
            }
        }
    });

    fetchAction('obj1');
    fetchAction('obj2');
    fetchAction('obj3');
    var numCached = Object.keys(store.streams.testProp.cache).length
    t.equal(numCached, 2, 'Cached items shouldn\'t exceed cacheLimit');

});