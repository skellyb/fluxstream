var Bacon = require('baconjs');

/**
 * Create a Flux action with self-contained dispatcher. Just call the returned
 * function with an optional payload to dispatch an event.
 * @param  {Function} validate An optional function that will be called before the
 *                             event is dispatched. If it returns false an error
 *                             is sent instead.
 * @return {Function}        Action function
 */
module.exports = function(validate) {
    var dispatcher = new Bacon.Bus();
    var fn = function(payload) {
        if (validate && typeof validate === 'function') {
            if (!validate(payload)) return Bacon.error('Bad payload:', payload);
        }

        dispatcher.push(payload);
    }

    /**
     * Access Bacon.js EventStream for this action
     * @type {EventStream}
     */
    fn.stream = dispatcher;


    /**
     * Provide a callback for every event that goes through this Action.
     * @param  {Function} callback Event callback will receive whatever payload
     *                             was dispatched through this action.    
     * @return {Function}          Unsubscribe function
     */
    fn.listen = function(callback) {
        return dispatcher.onValue(callback);
    };

    /**
     * Same as listen, but it unsubscribes itself after first event.
     * @param  {Function} callback Event callback will receive whatever payload
     *                             was dispatched through this action.    
     * @return {Function}          Unsubscribe function
     */
    fn.listenOnce = function(callback) {
        return dispatcher.onValue(function() {
            callback.apply(null, arguments);
            return Bacon.noMore;
        });
    };

    /**
     * Listen for errors in this action's EventStream
     * @param  {Function} callback Handle error
     * @return {Function}          Unsubscribe function
     */
    fn.errors = function(callback) {
        return dispatcher.onError(callback);
    };

    // return functor
    return fn;
};