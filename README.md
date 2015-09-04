### DEPRECATED:
I've been using [Redux](https://github.com/rackt/redux/), and it's pretty great. It achieves what I was trying to accomplish with a better solution. I also see a solid ecosystem growing around it.

If you're using Fluxstream now and run into issues, let me know, I'd be happy to help. Otherwise, I'd recommend giving Redux a try.
---
# Fluxstream
A lightweight [Flux](http://facebook.github.io/flux/) implementation that controls app state using [RxJS](https://github.com/reactive-extensions/RxJS) and [Immutable](http://facebook.github.io/immutable-js/). It pairs well with [React.js](http://facebook.github.io/react/) but doesn't require it.

## 2.0 — Complete Overhaul
Everything now revolves around a central core that's easy to pass around your app. Stores define the shape of your application state and how it should mutate when specific actions are called. With centralized, immutable data it's easy to save and restore your application's state at any point in time.

---

### Installation
```
npm install fluxstream
```

### Usage
First, you create the core of your application.
```
import { Core } from 'fluxstream'

const core = new Core()
```

Then add an action.
```
core.createActions('drive')
```

Define a store and add it to the core
```
import { Store } from 'fluxstream'

class CarStore extend Store {
  update () {
    return {
      drive: (core, payload, state) => {
        state.direction = payload
        return state
      }
    }
  }
}

core.createStore({
  car: CarStore
})
```

You're all setup. Now the `drive` action can be used to change the state of the car store.
```
core.actions.drive('forward')
core.get('car')
> { direction: 'forward' }
```

Listen for store changes.
*The result is wrapped in the store's object, making it easy to plug into React.Component.setState().*
```
core.stores.car.onUpdate((state) => console.log(state))
core.actions.drive('reverse')
> { car: { direction: 'reverse' } }
```

---

### API

#### Core
Once you create the core of your app, all of your interactions with state will happen here. It's easy to pass around your application giving you access to your actions, stores and data.

##### Core([config])
Initialize one instance of core for your app. Optionally, you can pass in store definitions and action names.
```
const core = new Core({
  stores: {
    car: CarStore
  },
  actions: ['drive']
})
```

##### Core.createActions(...names)
Pass in unique names as strings. You need to create actions before stores can use them.
```
core.createActions('drive', 'stop', 'openTrunk')
```

##### Core.createStores(stores)
Stores need a name and a class definition.
```
core.createStores({
  car: CarStore,
  track: TrackStore
})
```

##### Core.actions
Access all of your actions directly.
```
// call with a data payload
core.actions.drive({ direction: 'forward' })

// listen for activity
core.actions.drive.subscribe((payload) => console.log('Go ' + payload.direction))
```

##### Core.stores
Directly access stores.
```
core.stores.car.onUpdate((state) => console.log('Car store: ' + state))
```

##### Core.get()
Retrieve current state by store key. Pass in a string for the entire store branch of data, or narrow down by passing an array key path.
```
core.get('car')
core.get(['car', 'engineType'])
```

##### Core.combineStores(...names)
Get an Rx.Observable from multiple stores. If *any* of the stores changes you'll recieve all the current values in the same order you pass them into this function
```
core.combineStores('car', 'train')
  .subscribe((values) => console.log('Car: ' + values[0], 'Train: ' + values[1]))
```

##### Core.waitForStores(...names)
This creates an Rx.Observable that only fires when *all* of the listed stores
have updated.
```
core.waitForStores('car', 'train')
  .subscribe((values) => console.log('Car: ' + values[0], 'Train: ' + values[1]))
```

##### Core.waitForActions(...names)
This creates an Rx.Observable that only fires when *all* of the listed actions have updated.
```
core.waitForActions('drive', 'accelerate')
  .subscribe((payloads) => console.log('Drive: ' + payloads[0], 'Accelerate: ' + payloads[1]))
```

##### Core.takeSnapshot()
Returns an object representing current state across all stores.

##### Core.restore(state)
Restore state across all stores by passing in entire state object.

---

#### Stores
Stores define how branches of data are shaped and how they change over time. Like a React.Component you define what happens through the lifecycle of an event by overriding class methods. Instead of initializing these stores directly, you'll then pass your class definitions into Core.createStores().

##### Store.getInitialState()
By default returns an empty object, override method to define default state.
```
class CarStore extends Store {
  getInitialState () {
    return { transmission: 'auto' }
  }
}
```

##### Store.update()
This is the most important part of a store definition — declare how state changes over time. Override `update` method to return mutators that are associated with action names for keys. Whenever that action is called the returned value will be the new immutable object held by the store.

```
class CarStore extends Store {
  update () {
    return {
      drive: (core, payload, state) => {
       let car = state
       car.speed = payload
       return car
      }
    }
  }
}
```

##### Store.shouldUpdate(updatingState, currentState)
Override this method to validate state updates. Return false to prevent change.

##### Store.handle()
Sometimes a store needs to work with actions that don't mutate state. It's a great spot to deal with server interaction.

```
class CarStore extends Store {
  handle () {
    return {
      getRoute: (core, payload, state) => {
        xhr('/routes/0', (route) => core.actions.receiveRoute(route))
      }
    }
  }
}
```

##### Store.onUpdate(callback)
Listen for store data changes by passing in a callback. That function then receives the store's updated scoped data, making it easy to pass the results into a component's `setState` method.
```
core.stores.car.onUpdate(this.setState)
```

##### Store.replaceState(state)
Method used by `Core.restore()`. Can be used to force data directly into a store.

##### Store.observable
Access [RxJS observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md) directly.


#### Actions
Generally, you shouldn't need to interact with actions directly. Just give them a name via Core.createActions() and call them via the `Core.actions` accessor, passing data payloads into the action's function. If you had an action named 'go', you'd call it like so `core.actions.go('time')`. If you want to receive action events outside of your stores, you can subscribe to them or tap directly into the RxJS observable.

##### Action.subscribe(handler)
Pass in a callback to handle each action call. The handler should accept one payload argument.

##### Action.once(handler)
Same as `subscribe`, except it will unsubscribe from the action's observable stream.

##### Action.observable
Access the action's RxJS observable stream directly.
