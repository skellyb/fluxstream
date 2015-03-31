"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Im = require("immutable");

var Store = (function () {
    function Store(core, key) {
        var _this = this;

        _classCallCheck(this, Store);

        this._core = core;
        this._key = key;
        this._stream = new Bacon.Bus();
        this._actionUnsubs = Im.Set();

        var handlers = this.getActionHandlers();

        if (handlers) {
            Objects.keys(handlers).forEach(function (actionName) {
                var unsub = _this._core.actions.actionName.listen(_this.handleAction.bind(_this, handlers[actionName]));
                _this._actionUnsubs = _this._actionUnsubs.add(unsub);
            });
        } else {
            console.error("Error: No action handlers defined.");
        }

        this.initialize();
    }

    _prototypeProperties(Store, null, {
        initialize: {
            value: function initialize() {},
            writable: true,
            configurable: true
        },
        handleAction: {
            value: function handleAction(handler, payload) {
                var currState = this._core.get(this._key);

                if (shouldUpdate(currState, payload)) {
                    var updatedState = this.update(currState, payload);
                    this._stream.push(updatedState);
                    this.didUpdate(updatedState);
                }
            },
            writable: true,
            configurable: true
        },
        listen: {
            value: function listen(callback) {
                return this._stream.onValue(callback);
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

            // should return an object with actionName for keys
            // and handler functions for values

            value: function getActionHandlers() {
                return false;
            },
            writable: true,
            configurable: true
        },
        shouldUpdate: {
            value: function shouldUpdate(currentState, actionPayload) {
                return true;
            },
            writable: true,
            configurable: true
        },
        update: {
            value: function update(currentState, actionPayload) {
                return actionPayload;
            },
            writable: true,
            configurable: true
        },
        didUpdate: {
            value: function didUpdate(updatedState) {},
            writable: true,
            configurable: true
        }
    });

    return Store;
})();