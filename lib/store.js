'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Rx = require('rx');
var Im = require('immutable');

var Store = (function () {
  function Store(key, core) {
    var _this = this;

    var _core;

    _classCallCheck(this, Store);

    this._key = key;
    this._core = core;
    this._input = new Rx.Subject();
    this.observable = this._input.publish();
    this.observable.connect();

    var handlers = this.change();
    if (!handlers) return;

    var actionNames = Object.keys(handlers);
    var actions = (_core = this._core).createActions.apply(_core, _toConsumableArray(actionNames));
    actionNames.forEach(function (name) {
      actions[name].subscribe(_this._handleAction.bind(_this, handlers[name]));
    });
  }

  _createClass(Store, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }, {
    key: 'change',
    value: function change() {}
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate(updatedState, currentState) {
      return true;
    }
  }, {
    key: 'didUpdate',
    value: function didUpdate(currentState) {}
  }, {
    key: 'subscribe',
    value: function subscribe(valHandler, errHandler, completeHandler) {
      return this.observable.subscribe(valHandler, errHandler, completeHandler);
    }
  }, {
    key: 'replaceState',
    value: function replaceState(state) {
      this._input.onNext(state);
    }
  }, {
    key: '_validateUpdate',
    value: function _validateUpdate(updatedState, currentState) {
      return updatedState !== undefined && this.shouldUpdate(updatedState, currentState);
    }
  }, {
    key: '_handleAction',
    value: function _handleAction(handler, payload) {
      var currentState = this._core.get(this._key);
      if (Im.Iterable.isIterable(currentState)) {
        currentState = currentState.toJS();
      }

      var updatedState = handler(payload, currentState);

      if (this._validateUpdate(updatedState, currentState)) {
        this._input.onNext(updatedState);
      }
    }
  }]);

  return Store;
})();

module.exports = Store;