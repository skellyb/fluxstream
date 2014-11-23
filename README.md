# Fluxstream
A lightweight Flux solution that controls data flow around your app using [Bacon.js](http://baconjs.github.io) EventStreams. It pairs well with [React.js](http://facebook.github.io/react/) but doesn't require it. Most of the smart thinking is from Facebook's [Flux](https://facebook.github.io/flux/), and more specifically, [RefluxJS](https://github.com/spoike/refluxjs), where this approach is simplified by giving each action its own dispatcher. A brilliant way to streamline Flux. All I’ve done is implement that idea using Bacon.js, making it easier for me to use that functional reactive programming library elsewhere in my application.

You don't have to use Bacon.js anywhere else in your app, but if you want to, it's easy take these to EventStreams and manipulate them at your leisure.


## Installation
```
npm install fluxstream
```


## Usage
### Create an action
The action factory returns a function you call elsewhere in your app to dispatch an event.
```
var flux = require('fluxstream');
var appAction = flux.createAction();
```
#### Create several actions at once
This returns an object with action names for keys and action functions for values.
```
var actions = flux.createActions(['doSomething', 'doSomethingElse']);
```

### Dispatch an event
Just call the action function, passing in an object if you want to include a payload.
```
appAction();
actions.doSomethingElse('with this');
```
#### Run code or validate the payload before the action fires the event
Provide a function when you create the action. Return false if you want to cancel the action and throw a validation error.
```
var anotherAction = flux.createAction(function(payload) {
    return (payload === 'Valid Value');
});
```

### Listen to actions
Each action contains its own dispatcher, so just listen to the action for events.
```
appActions.listen(function(payload) {
   // handle event 
});
```
#### Watch for errors
```
appActions.errors(function(err) {
   // handle error
});
```

### Create a store
In its most basic form you can create a store that doesn't do much. The factory returns an instantiated store object, so it's an easy make this a singleton if using this with something like [Browserify](http://browserify.org).
```
module.exports = flux.createStore();
```
#### Configure your store
Usually, you'd want to pass in a definition to give the store something to do. An _init_ function will run when you create the store, and a special config object will setup streaming properties based on action events.
```
var store = flux.createStore({
    init: function() {
        // runs store when store created and configured
    },

    config: {
        // this property name will be used to listen for  changes
        propName: {
            // the action events and payloads that populate this property
            action: appAction,

            // (optional) transform the event payloads
            map: callback,

            // (optional) provide an initial value for property
            init: {}
        }
    }
});
```

#### Respond to changes
You can either listen to changes to all the changes in a store, or single property in the `streams` object setup in configuration.
```
store.listen(function(payload) {
    // handle all events
});

store.streams.propName.listen(function(payload) {
    // get current value and all future values
});
```

## A barebones example
```
var React = require('react');
var flux = require('fluxstream');

var flipSwitch = flux.createAction();

var store = flux.createStore({
    config: {
        switchState: {
            action: flipSwitch,
            map: function (val) {
                return { isOn: !val.isOn }
            },
            init: { isOn: false }
        }
    }
});

var Light = React.createClass({
    componentDidMount: function() {
        this.props.store.streams.switchState.listen(this.setState.bind(this));
    },

    render: function() {
        return <div onClick={ flipSwitch } >Light is { (this.state.isOn) ? 'on' : 'off' }</div>;
    }
});

React.render(
    <Light store={ store } />,
    document.getElementById('app')
);

```

# API

## Actions

### fluxstream.createAction(validate)

Create a Flux action with self-contained dispatcher. Just call the returned function with an optional payload to dispatch an event.

**Parameters**

**validate**: `function`, An optional function that will be called before theevent is dispatched. If it returns false an error is sent instead.

**Returns**: `function`, Action function


### fluxstream.createActions(actionNames) 

Shortcut to create multiple actions.

**Parameters**

**actionNames**: `Array`, A list of strings that will define action names.

**Returns**: `Object`, An object with names for keys and action functions for values.


### action.listen(callback) 

Provide a callback for every event that goes through this Action.

**Parameters**

**callback**: `function`, Event callback will receive whatever payload was dispatched through this action.

**Returns**: `function`, Unsubscribe function


### action.listenOnce(callback) 

Same as listen, but it unsubscribes itself after first event.

**Parameters**

**callback**: `function`, Event callback will receive whatever payload was dispatched through this action.

**Returns**: `function`, Unsubscribe function


### action.errors(callback) 

Listen for errors in this action's EventStream

**Parameters**

**callback**: `function`, Handle error

**Returns**: `function`, Unsubscribe function

* * *

## Store

### fluxstream.createStore(definition) 

Create a Flux store that exposes Bacon.js properties based off of action EventStreams. Also allows you to combine streams, making it easy to deal with async dependencies.

**Parameters**

**definition**: `Object`, Extend the store with optional init and config plus any custom functions or properties you might want.

**Returns**: `Object`, Instantiated store.


### store.configure(config) 

Configure this store's reactive properties. Ideally, pass a config object into the createStore definition, and the store will call this on instantiation.

**Parameters**

**config**: `Object`, keys define the property names, and the object vals need to define an action. Optionally, a map function for transforming the action payload or init for initial property value.

**Returns**: `EventStream`, A stream of all the property streams created.

The config object should look something like this:
{ 
  propName: {
     action: action,
     map: callback,
     init: {}
  }
}


### store.listen(callback) 

Provide a callback for every event that goes through the store's properites.

**Parameters**

**callback**: `function`, Event callback will receive whatever payloadwas dispatched through the actions.

**Returns**: `function`, Unsubscribe function


### store.combine(streams, callback) 

Combine EventStreams and capture all the events in one object, making multiple async events easier to deal with. Pass in an array of store streams you want to listen to, and the callback will receive an object with all the values. The keys will be the same name as the stream, and the values will be the stream payloads.

**Parameters**

**streams**: `Array`, An array of EventStreams.

**callback**: `function`, Handles combined events. An object is passed in with all the associated payloads behind keys with the action names.

**Returns**: `function`, Unsubscribe function


### combineOnce(streams, callback) 

Same as combine, just it unsubscribes itself after first combined event fires.

**Parameters**

**streams**: `Array`, An array of EventStreams.

**callback**: `function`, Handles combined events. An object is passed in with all the associated payloads behind keys with the action names.

**Returns**: `function`, Unsubscribe function


### store.errors(callback) 

Listen for errors in all of the store's event streams.

**Parameters**

**callback**: `function`, Handle error

**Returns**: `function`, Unsubscribe function
