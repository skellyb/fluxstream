'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Rx = require('rx');

var Action = function Action() {
  _classCallCheck(this, Action);

  var input = new Rx.Subject();
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

module.exports = Action;