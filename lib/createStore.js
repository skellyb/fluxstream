var Bacon = require('baconjs');
var utils = require('./utils');

function createTemplate(streams) {
    var template  = {};
    streams.forEach(function(stream) {
        template[stream.name] = stream;
    });

    return template;
}

/**
 * Create a Flux store that exposes Bacon.js properties based off of action 
 * EventStreams. Also allows you to combine streams, making it easy to deal with
 * async dependencies.
 * 
 * @param  {Object} def Extend the store with optional init and config plus any 
 *                      custom functions or properties you might want.
 * @return {Object}     Instantiated store. Because of require's caching this is
 *                      a singleton.
 */
module.exports = function(def) {

    function Store() {
        this.stream = new Bacon.Bus();

        if (this.config && typeof this.config === 'object') this.configure(this.config);
        if (this.init && typeof this.init === 'function') this.init();
    }

    if (def) utils.extend(Store.prototype, def);
    

    /**
     * Configure this store's reactive properties.
     * @param  {Object} config keys define the property names, and the object
     *                         vals need to define an action. Optionally,
     *                         a map function for transforming the action 
     *                         payload or init for initial property value.
     * @return {EventStream}   A stream of all the property streams created.
     *
     * The config object should look something like this:
     * { 
     *   propName: {
     *      action: action,
     *      map: callback,
     *      init: {}
     *   }
     * }
     */
    Store.prototype.configure = function(config) {
        this.streams = {};

        // setup streaming properties
        Object.keys(config).forEach(function(prop) {
            var map = config[prop].map || function (val) { return val; };
            var stream = config[prop].action.stream
                .flatMap(map)
                .toProperty(config[prop].init);

            stream.listen = function(callback) {
                return stream.onValue(callback);
            };

            stream.listenOnce = function(callback) {
                return stream.onValue(function() {
                    callback.apply(null, arguments);
                    return Bacon.noMore;
                });
            };

            stream.name = prop;

            this.streams[prop] = stream;
        }, this);

        // send all store events through store dispatcher
        var allStreams = Object.keys(this.streams).map(function(streamName) {
            return this.streams[streamName];
        }, this);

        return this.stream.plug(Bacon.mergeAll(allStreams));
    };

    /**
     * Provide a callback for every event that goes through the Store.
     * @param  {Function} callback Event callback will receive whatever payload
     *                             was dispatched through the actions.    
     * @return {Function}          Unsubscribe function
     */
    Store.prototype.listen = function(callback) {
        return this.stream.onValue(callback);
    };

    /**
     * Combine EventStreams and capture all the events in one object, making 
     * multiple async events easier to deal with. Pass in an array of store 
     * streams you want to listen to, and the callback will receive an object
     * with all the values. The keys will be the same name as the stream, and 
     * the values will be the stream payloads.
     * 
     * @param  {Array}   streams  An array of EventStreams.
     * @param  {Function} callback Handles combined events. An object is passed
     *                             in with all the associated payloads behind
     *                             keys with the action names. 
     * @return {Function}         Unsubscribe function
     */
    Store.prototype.combine = function(streams, callback) {
        return Bacon.combineTemplate( createTemplate(streams) ).onValue(callback);
    };

    /**
     * Same as combine, just it unsubscribes itself after first event.
     * @param  {Array}   streams  An array of EventStreams.
     * @param  {Function} callback Handles combined events. An object is passed
     *                             in with all the associated payloads behind
     *                             keys with the action names. 
     * @return {Function}         Unsubscribe function
     */
    Store.prototype.combineOnce = function(streams, callback) {
        return Bacon.combineTemplate( createTemplate(streams) ).onValue(function(combo) {
            callback(combo);
            return Bacon.noMore;
        });
    }

    /**
     * Listen for errors in the event stream
     * @param  {Function} callback Handle error
     * @return {Function}          Unsubscribe function
     */
    Store.prototype.errors = function(callback) {
        return this.stream.onError(callback);
    };

    // returns instantiated store
    return new Store();
};