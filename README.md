# Fluxstream
A lightweight Flux solution that controls data flow around your app using (Bacon.js)[http://baconjs.github.io] EventStreams. It pairs well with (React.js)[http://facebook.github.io/react/] but doesn't require it. Most of the smart thinking is from Facebook's (Flux)[https://facebook.github.io/flux/], and more specifically, (RefluxJS)[https://github.com/spoike/refluxjs], where this approach is simplified by giving each action its own dispatcher. A brilliant way to streamline Flux. All I’ve done is implement that idea using Bacon.js, making it easier for me to use that functional reactive programming library elsewhere in my application.

You don't have to use Bacon.js anywhere else in your app, but if you want to, it's easy take these EventStreams and manipulate them at your leisure.


## Installation
```
npm install fluxstream
```


## Usage
### Create an action
#### Or several actions at once

### Create a store
#### Configure your store

### Use actions in stores
#### Dispatch an event
#### Respond to changes

## API

