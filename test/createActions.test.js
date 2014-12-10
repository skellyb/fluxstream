var test = require('tape');
var createActions = require('../lib/createActions');

test('Create Multiple Actions', function(t) {
    t.plan(1);
    
    var actions = createActions(['one', 'two', 'three']);
    t.equal(Object.keys(actions).length, 3, 'an object was created with 3 actions');
});