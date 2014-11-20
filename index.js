/**
 * FluxStream: A lightweight Flux solution that controls data flow around your 
 * app using Bacon.js EventStreams. It pairs well with React.js, but doesn't 
 * require it. Most of the smart thinking happened here: spoike/refluxjs. Having
 * each action control its own dispatcher was a brilliant way to streamline Flux.
 *
 * You don't have to use Bacon.js anywhere else in your app, but if you want to,
 * it's easy take these EventStreams and manipulate them at your leisure.
 * 
 * @module fluxstream
 */
module.exports = {
    createAction: require('./lib/createAction'),
    createActions: require('./lib/createActions'),
    createStore: require('./lib/createStore')
};