var createAction = require('./createAction');

/**
 * Shortcut to create multiple actions.
 * @param  {Array} actionNames A list of strings that will define action names.
 * @return {Object}             An object with names for keys and action functions for values.
 */
module.exports = function(actionNames) {
    var actions = {};
    actionNames.forEach(function(name) {
        actions[name] = createAction();
    });

    return actions;
};