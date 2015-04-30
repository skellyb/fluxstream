"use strict";

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Im = require("immutable");
var Action = require("./action");
var Bacon = require("baconjs");

var Core = (function () {
  function Core(options) {
    _classCallCheck(this, Core);

    var opts = options || {};
    this._state = Im.Map({});
    this._stores = Im.Map(opts.stores || {});
    this._actions = Im.Map(opts.actions || {});
  }

  _prototypeProperties(Core, null, {
    createStores: {
      value: function createStores() {
        var _this = this;

        for (var _len = arguments.length, storeClasses = Array(_len), _key = 0; _key < _len; _key++) {
          storeClasses[_key] = arguments[_key];
        }

        var newStores = Im.Map({});

        storeClasses.forEach(function (Def) {
          var initStore = new Def(_this);
          var key = initStore.getKey();
          newStores = newStores.set(key, initStore);

          _this._updateState(key, initStore.getInitialState());

          initStore.observe(function (updatedState) {
            _this._updateState(key, updatedState);
            initStore.didUpdate(_this.get(key));
          });
        });

        this._stores = this._stores.merge(newStores);
        console.log(this._state);
      },
      writable: true,
      configurable: true
    },
    addActions: {
      value: function addActions() {
        for (var _len = arguments.length, actionNames = Array(_len), _key = 0; _key < _len; _key++) {
          actionNames[_key] = arguments[_key];
        }

        var newActions = Im.Map({});
        actionNames.forEach(function (name) {
          return newActions = newActions.set(name, new Action());
        });
        this._actions = newActions.merge(this._actions);
        return this._actions.toObject();
      },
      writable: true,
      configurable: true
    },
    actions: {
      get: function () {
        return this._actions.toObject();
      },
      configurable: true
    },
    get: {
      value: function get(keyPath) {
        return Array.isArray(keyPath) ? this._state.getIn(keyPath) : this._state.get(keyPath);
      },
      writable: true,
      configurable: true
    },
    observe: {
      value: function observe() {
        var _this = this;

        for (var _len = arguments.length, keyPathsAndHandler = Array(_len), _key = 0; _key < _len; _key++) {
          keyPathsAndHandler[_key] = arguments[_key];
        }

        var _parseArgsAndCallback = this._parseArgsAndCallback(keyPathsAndHandler);

        var keyPaths = _parseArgsAndCallback.args;
        var handler = _parseArgsAndCallback.callback;

        var observeStream = Bacon.mergeAll(this._getStoreStreams(keyPaths));

        return observeStream.onValue(function () {
          handler.apply(undefined, _toConsumableArray(_this._getStateFromPaths(keyPaths)));
        });
      },
      writable: true,
      configurable: true
    },
    zip: {

      // TODO: Name better: observeAll, waitFor or something

      value: function zip() {
        var _this = this;

        for (var _len = arguments.length, keyPathsAndHandler = Array(_len), _key = 0; _key < _len; _key++) {
          keyPathsAndHandler[_key] = arguments[_key];
        }

        var _parseArgsAndCallback = this._parseArgsAndCallback(keyPathsAndHandler);

        var keyPaths = _parseArgsAndCallback.args;
        var handler = _parseArgsAndCallback.callback;

        var zipStream = Bacon.zipAsArray(this._getStoreStreams(keyPaths));

        return zipStream.onValue(function () {
          handler.apply(undefined, _toConsumableArray(_this._getStateFromPaths(keyPaths)));
        });
      },
      writable: true,
      configurable: true
    },
    takeSnapshot: {
      value: function takeSnapshot() {
        return this._state.toJS();
      },
      writable: true,
      configurable: true
    },
    restore: {
      value: function restore(state) {
        // TODO: Still needs to trigger observers
        this._state = Im.fromJS(state);
      },
      writable: true,
      configurable: true
    },
    _parseArgsAndCallback: {
      value: function _parseArgsAndCallback(argsAndCB) {
        var args = argsAndCB.slice(0, -1);
        var callback = argsAndCB.pop();

        if (typeof callback !== "function") throw new Error("No callback argument defined");

        return { args: args, callback: callback };
      },
      writable: true,
      configurable: true
    },
    _getStoreStreams: {
      value: function _getStoreStreams(keyPaths) {
        var _this = this;

        return keyPaths.map(function (key) {
          var storeKey = Array.isArray(key) ? key[0] : key;
          return _this._stores.get(storeKey).getStream();
        });
      },
      writable: true,
      configurable: true
    },
    _getStateFromPaths: {
      value: function _getStateFromPaths(keyPaths) {
        var _this = this;

        return keyPaths.map(function (path) {
          var pathArr = Array.isArray(path) ? path : [path];
          var val = _this._state.getIn(pathArr);
          return Im.Iterable.isIterable(val) ? val.toJS() : val;
        });
      },
      writable: true,
      configurable: true
    },
    _updateState: {
      value: function _updateState(name, data) {
        var update = {};
        update[name] = data;
        var immutableUpdate = Im.fromJS(update);
        this._state = this._state.merge(immutableUpdate);
      },
      writable: true,
      configurable: true
    }
  });

  return Core;
})();

module.exports = Core;