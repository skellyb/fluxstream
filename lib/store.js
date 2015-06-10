'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var Store = (function () {
  function Store(key, core) {
    var _this = this;

    _classCallCheck(this, Store);

    this._key = key;
    this._core = core;
    this._input = new _rx2['default'].Subject();
    this.observable = this._input.publish();
    this.observable.connect();

    var updaters = this.update();
    var handlers = this.handle();
    if (!updaters && !handlers) return;

    if (updaters && typeof updaters === 'object') {
      Object.keys(updaters).forEach(function (name) {
        if (!_this._validateAction(name)) return;
        _this._core.actions[name].subscribe(_this._handleAction.bind(_this, updaters[name]));
      });
    }

    if (handlers && typeof handlers === 'object') {
      Object.keys(handlers).forEach(function (name) {
        if (!_this._validateAction(name)) return;
        _this._core.actions[name].subscribe(handlers[name].bind(_this, _this._core));
      });
    }
  }

  _createClass(Store, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }, {
    key: 'handle',
    value: function handle() {}
  }, {
    key: 'update',
    value: function update() {}
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate(updatedState, currentState) {
      return true;
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      var _this2 = this;

      return this.observable.subscribe(function (updatedState) {
        return callback(_defineProperty({}, _this2._key, updatedState));
      });
    }
  }, {
    key: 'didUpdate',
    value: function didUpdate(currentState) {}
  }, {
    key: 'replaceState',
    value: function replaceState(state) {
      this._input.onNext(state);
    }
  }, {
    key: '_validateAction',
    value: function _validateAction(name) {
      if (this._core.actions[name]) return true;
      throw new Error('No action named ' + name);
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
      if (_immutable2['default'].Iterable.isIterable(currentState)) {
        currentState = currentState.toJS();
      }

      var updatedState = handler(this._core, payload, currentState);

      if (this._validateUpdate(updatedState, currentState)) {
        this._input.onNext(updatedState);
      }
    }
  }]);

  return Store;
})();

module.exports = Store;