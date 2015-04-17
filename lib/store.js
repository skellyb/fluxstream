"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Bacon = require("baconjs");

var Store = (function () {
  function Store(core) {
    var _this = this;

    _classCallCheck(this, Store);

    this._core = core;
    this._stream = new Bacon.Bus();

    var handlers = this.getActionHandlers();
    var actionNames = Object.keys(handlers);
    var actions = this._core.addActions(actionNames);
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