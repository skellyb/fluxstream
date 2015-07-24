'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Action = function Action() {
  _classCallCheck(this, Action);

  var input = new _rx2['default'].Subject();
  var dispatcher = input.publish();
  var actionFunc = function actionFunc(payload) {
    return input.onNext(payload);
  };

  dispatcher.connect();

  actionFunc.observable = dispatcher;

  actionFunc.subscribe = function (valHandler, errHandler, completeHandler) {
    return dispatcher.subscribe(valHandler, errHandler, completeHandler);
  };

  actionFunc.once = function (valHandler, errHandler, completeHandler) {
    return dispatcher.take(1).subscribe(valHandler, errHandler, completeHandler);
  };

  return actionFunc;
};

exports['default'] = Action;
module.exports = exports['default'];