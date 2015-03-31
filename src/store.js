const Im = require('immutable');

class Store {
    constructor(core, key) {
        
        this._core = core;
        this._key = key;
        this._stream = new Bacon.Bus();
        this._actionUnsubs = Im.Set();

        const handlers = this.getActionHandlers();

        if (handlers) {
            Objects.keys(handlers).forEach((actionName) => {
                const unsub = this._core.actions.actionName.listen( this.handleAction.bind(this, handlers[actionName]) );
                this._actionUnsubs = this._actionUnsubs.add(unsub);
            });
        } else {
            console.error('Error: No action handlers defined.');
        }

        this.initialize();
    }

    initialize() {}

    handleAction(handler, payload) {
        const currState = this._core.get(this._key);
        
        if (shouldUpdate(currState, payload)) {
            const updatedState = this.update(currState, payload);
            this._stream.push(updatedState);
            this.didUpdate(updatedState);
        }
    }

    listen(callback) {
        return this._stream.onValue(callback);
    }

    getInitialState() {
        return {};
    }

    // should return an object with actionName for keys
    // and handler functions for values
    getActionHandlers() {
        return false;
    }

    shouldUpdate(currentState, actionPayload) {
        return true;
    }

    update(currentState, actionPayload) {
        return actionPayload;
    }

    didUpdate(updatedState) {}
}
