"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Bacon = require("baconjs");

var Action = function Action() {
  _classCallCheck(this, Action);

  var _dispatcher = new Bacon.Bus();
  var _func = function (payload) {
    return _dispatcher.push(payload);
  };

  _func.stream = function () {
    return _dispatcher;
  };

  _func.observe = function (callback) {
    return _dispatcher.onValue(callback);
  };

  _func.once = function (callback) {
    return _dispatcher.onValue(function (payload) {
      callback(payload);
      return Bacon.noMore;
    });
  };

  return _func;
};

module.exports = Action;