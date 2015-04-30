"use strict";

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Bacon = require("baconjs");
var Im = require("immutable");

var Store = (function () {
  function Store(core) {
    var _this = this;

    var _core;

    _classCallCheck(this, Store);

    this._core = core;
    this._stream = new Bacon.Bus();

    var handlers = this.getActionHandlers();
    var actionNames = Object.keys(handlers);
    var actions = (_core = this._core).addActions.apply(_core, _toConsumableArray(actionNames));
    actionNames.forEach(function (name) {
      actions[name].observe(_this._handleAction.bind(_this, handlers[name]));
    });
  }

  _prototypeProperties(Store, null, {
    getKey: {
      value: function getKey() {
        throw new Error("No key defined.");
      },
      writable: true,
      configurable: true
    },
    getInitialState: {
      value: function getInitialState() {
        return {};
      },
      writable: true,
      configurable: true
    },
    getActionHandlers: {
      value: function getActionHandlers() {
        throw new Error("No action handlers defined.");
      },
      writable: true,
      configurable: true
    },
    shouldUpdate: {
      value: function shouldUpdate(updatedState, currentState) {
        return true;
      },
      writable: true,
      configurable: true
    },
    didUpdate: {
      value: function didUpdate(currentState) {},
      writable: true,
      configurable: true
    },
    observe: {
      value: function observe(callback) {
        return this._stream.onValue(callback);
      },
      writable: true,
      configurable: true
    },
    getStream: {
      value: function getStream() {
        return this._stream;
      },
      writable: true,
      configurable: true
    },
    _validateUpdate: {
      value: function _validateUpdate(updatedState, currentState) {
        return updatedState !== undefined && this.shouldUpdate(updatedState, currentState);
      },
      writable: true,
      configurable: true
    },
    _handleAction: {
      value: function _handleAction(handler, payload) {
        var currentState = this._core.get(this.getKey());
        if (Im.Iterable.isIterable(currentState)) {
          currentState = currentState.toJS();
        }

        var updatedState = handler(payload, currentState);

        if (this._validateUpdate(updatedState, currentState)) {
          this._stream.push(updatedState);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Store;
})();

module.exports = Store;