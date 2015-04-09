const Bacon = require('baconjs');

class Action {
    constructor(handler) {
        const handler = handler || Function.prototype;
        const _dispatcher = new Bacon.Bus();
        const _func = (payload) => {
            handler(payload);
            _dispatcher.push(payload)
        };

        _func.stream = () => _dispatcher;

        _func.listen = (callback) => _dispatcher.onValue(callback);

        _func.once = (callback) => {
            return _dispatcher.onValue((payload) => {
                callback(payload);
                return Bacon.noMore;
            });
        };

        return _func;
    }
}

module.exports = Action;