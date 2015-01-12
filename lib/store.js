var Bacon = require('baconjs');
var propPath = require('property-path');
var utils = require('./utils');

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
var FluxStore = function(def) {

    function Store(options) {
        options || (options = {});
        if (options.actions) this.actions = options.actions;

        this.stream = new Bacon.Bus();

        if (this.config && typeof this.config === 'object') this.configure(this.config);
        if (this.config && typeof this.config === 'function') this.configure(this.config());
        if (this.init && typeof this.init === 'function') this.init(options);
    }

    if (def) utils.extend(Store.prototype, def);
    

    /**
     * Configure this store's reactive properties.
     * @param  {Object} config keys define the property names, and the object
     *                         vals need to define an action. Optionally,
     *                         a map function for transforming the action 
     *                         payload or init for initial property value. 
     *                         You can also configure how data pushed into the
     *                         stream with inputAction and inputHandler, which
     *                         can be paired with a simple key value cache based
     *                         on property in the streams payload via cacheKey
     *                         and limit the numbder of value in the cache with
     *                         cacheLimit.
     *                         
     * @return {EventStream}   A stream of all the property streams created.
     *
     * The config object should look something like this:
     * { 
     *   propName: {
     *      action: action,
     *      map: callback,
     *      init: {},
     *      inputAction: action,
     *      inputHandler: func,
     *      inputKey: 'string',
     *      cacheKey: 'string',
     *      cacheLimit: 100
     *   }
     * }
     */
    Store.prototype.configure = function(config) {
        this.streams = {};

        // setup streaming properties
        Object.keys(config).forEach(function(prop) {
            var propConfig = config[prop];
            if (!propConfig.action) return console.warn('Warning: Can\'t setup streaming prop, no action found for: ' + prop);

            var map = propConfig.map || function (val) { return val; };

            var stream = propConfig.action.stream
                .flatMap(map)
                .toProperty(config[prop].init);

            if (propConfig.inputAction) {
                // setup cache
                stream.cache = {};
                stream.changes().onValue( updateCache.bind(stream, propConfig.cacheKey, propConfig.cacheLimit) );

                // setup input
                propConfig.inputAction.listen(function(payload) {
                    // send cache or emtpy state into receiver action stream
                    var cacheVal = getCached.call(stream, propConfig.inputKey, payload) || propConfig.init || {};
                    propConfig.action(cacheVal);

                    // handle input
                    propConfig.inputHandler(payload);
                });
            }

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

        var mergedStream = Bacon.mergeAll(allStreams);

        // warm up properties so stores can be created before components are listening
        mergedStream.onValue(Function.prototype);

        return this.stream.plug(mergedStream);
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
     * Combine EventStreams and once each event fires the payloads are sent to 
     * the listeners grouped as an array, making multiple async events easier 
     * to deal with. This is different from Bacon's combine functions.
     * 
     * @param  {Array}   streams  An array of EventStreams.
     * @param  {Function} callback Handles combined events. An array is passed
     *                             in with all the associated payloads grouped,
     *                             i.e. [1st, 1st]...[2nd, 2nd]...etc.
     * @return {Function}         Unsubscribe function
     */
    Store.prototype.combine = function(streams, callback) {
        return Bacon.zipAsArray(streams).onValue(callback);
    };

    /**
     * Same as combine, just it unsubscribes itself after first event.
     * @param  {Array}   streams  An array of EventStreams.
     * @param  {Function} callback Handles combined events. An array is passed
     *                             in with the first set of payloads in an array. 
     * @return {Function}         Unsubscribe function
     */
    Store.prototype.combineOnce = function(streams, callback) {
        return Bacon.zipAsArray(streams).onValue(function(combo) {
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

    return Store;
};

module.exports = {
    createStore: function(def) {
        var Store = FluxStore(def);
        return new Store();
    },

    defineStore: FluxStore
};

function updateCache(key, limit, payload) {
    var cacheLimit = limit || 100;

    // if cache is full remove oldest value
    var keys = Object.keys(this.cache);
    if (keys.length === cacheLimit) {
        delete this.cache[ keys[0] ];
    }

    // update
    var id = getID(key, payload);
    if (id) this.cache[id] = payload;
}

function getCached(key, payload) {
    return this.cache[ getID(key, payload) ];
}

function getID(key, obj) {
    return (!key || key === '') ? obj : propPath.get(obj, key);
}