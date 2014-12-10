var test = require('tape');
var createAction = require('../lib/createAction');

test('Action Creator', function(t) {
    t.plan(8);

    t.equal(typeof createAction(), 'function', 'create action returns a function');
    
    var action = createAction();
    action.stream.onValue(function(val) {
        t.ok(val, 'action.stream returns a Bacon.js EventStream');
    })
    action('bacon');

    action = createAction();
    action.listen(function(payload) {
        t.equal(payload, 'data', 'listen callback receives an event payload');
    });
    action('data');
    
    action = createAction();
    action.listenOnce(function(payload) {
        t.equal(payload, 'data', 'listenOnce callback receives an event payload');
    });
    action('data');

    var count = 0;
    action = createAction();
    action.listenOnce(function(payload) {
        count += 1;
    });
    action('one');
    action('two');
    t.equal(count, 1, 'listenOnce unsubs self, only called once');
    
    var order = 'fail';
    action = createAction(function(payload) {
        return order = 'before';
    });
    action.listen(function(payload) {
        t.equal(order, 'before', 'validate function called before event payload is sent');
    });
    action();

    action = createAction(function(payload) {
        return payload === 'valid';
    });
    action.listen(function(payload) {
        t.equal(payload, 'valid', 'validate function prevents invalid payload from passing through');
    });
    action('fail');
    action('valid');

    action = createAction(function(payload) {
        return payload === 'valid';
    });
    action.errors(function(err) {
        t.ok(err, 'capture validation error');
    });
    action('fail');
});