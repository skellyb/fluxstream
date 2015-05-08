'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Im = require('immutable');
var Action = require('./action');
var Rx = require('rx');

var Core = (function () {
  function Core(options) {
    _classCallCheck(this, Core);

    var opts = options || {};
    this._state = Im.Map({});
    this._stores = Im.Map({});
    this._actions = Im.Map({});

    if (opts.stores) this.createStores(opts.stores);
    if (opts.actions) this.createActions.apply(this, _toConsumableArray(opts.actions));
  }

  _createClass(Core, [{
    key: 'createStores',
    value: function createStores(storeMap) {
      var _this = this;

      var keys = Object.keys(storeMap);
      var newStores = Im.Map({});

      keys.forEach(function (key) {
        var StoreDef = storeMap[key];
        var initStore = new StoreDef(key, _this);
        newStores = newStores.set(key, initStore);

        _this._updateState(key, initStore.getInitialState());

        initStore.subscribe(function (updatedState) {
          _this._updateState(key, updatedState);
          initStore.didUpdate(_this.get(key));
        });
      });

      this._stores = this._stores.merge(newStores);
    }
  }, {
    key: 'createActions',
    value: function createActions() {
      for (var _len = arguments.length, actionNames = Array(_len), _key = 0; _key < _len; _key++) {
        actionNames[_key] = arguments[_key];
      }

      var newActions = Im.Map({});
      actionNames.forEach(function (name) {
        return newActions = newActions.set(name, new Action());
      });
      this._actions = newActions.merge(this._actions);
      return this._actions.toObject();
    }
  }, {
    key: 'actions',
    get: function () {
      return this._actions.toObject();
    }
  }, {
    key: 'stores',
    get: function () {
      return this._stores.toObject();
    }
  }, {
    key: 'get',
    value: function get(keyPath) {
      var val = Array.isArray(keyPath) ? this._state.getIn(keyPath) : this._state.get(keyPath);
      return Im.Iterable.isIterable(val) ? val.toJS() : val;
    }
  }, {
    key: 'combineStores',
    value: function combineStores() {
      var _this2 = this;

      var _Rx$Observable;

      for (var _len2 = arguments.length, stores = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        stores[_key2] = arguments[_key2];
      }

      return (_Rx$Observable = Rx.Observable).merge.apply(_Rx$Observable, _toConsumableArray(this._getObservables('_stores', stores))).map(function () {
        return stores.map(function (name) {
          return _this2.get(name);
        });
      });
    }
  }, {
    key: 'waitForStores',
    value: function waitForStores() {
      for (var _len3 = arguments.length, stores = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        stores[_key3] = arguments[_key3];
      }

      return this._waitFor('_stores', stores);
    }
  }, {
    key: 'waitForActions',
    value: function waitForActions() {
      for (var _len4 = arguments.length, actions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        actions[_key4] = arguments[_key4];
      }

      return this._waitFor('_actions', actions);
    }
  }, {
    key: 'takeSnapshot',
    value: function takeSnapshot() {
      return this._state.toJS();
    }
  }, {
    key: 'restore',
    value: function restore(state) {
      var _this3 = this;

      var storeKeys = Object.keys(state);
      storeKeys.forEach(function (key) {
        _this3._stores.get(key).replaceState(state[key]);
      });
    }
  }, {
    key: '_waitFor',
    value: function _waitFor(type, keys) {
      var _this4 = this;

      return Rx.Observable.just().flatMap(function () {
        var _Rx$Observable2;

        return (_Rx$Observable2 = Rx.Observable).zipArray.apply(_Rx$Observable2, _toConsumableArray(_this4._getObservables(type, keys)));
      });
    }
  }, {
    key: '_getObservables',
    value: function _getObservables(type, keys) {
      var _this5 = this;

      var storeKeys = Array.isArray(keys) ? keys : [keys];
      return storeKeys.map(function (name) {
        return _this5[type].get(name).observable;
      });
    }
  }, {
    key: '_updateState',
    value: function _updateState(name, data) {
      this._state = this._state.set(name, Im.fromJS(data));
    }
  }]);

  return Core;
})();

module.exports = Core;