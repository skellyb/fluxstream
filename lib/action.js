"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Bacon = require("baconjs");

var Action = function Action(handler) {
    _classCallCheck(this, Action);

    var handler = handler || Function.prototype;
    var _dispatcher = new Bacon.Bus();
    var _func = function (payload) {
        handler(payload);
        _dispatcher.push(payload);
    };

    _func.stream = function () {
        return _dispatcher;
    };

    _func.listen = function (callback) {
        return _dispatcher.onValue(callback);
    };

    _func.once = function (callback) {
        return _dispatcher.onValue(function () {
            for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
                payload[_key] = arguments[_key];
            }

            callback.apply(undefined, payload);
            return Bacon.noMore;
        });
    };

    return _func;
};

module.exports = Action;