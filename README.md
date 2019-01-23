# react-context-global-store

[![NPM version](https://img.shields.io/npm/v/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)
[![NPM size](https://img.shields.io/bundlephobia/min/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)
[![NPM downloads](https://img.shields.io/npm/dt/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)

## INTRODUCTION

[中文版介绍](https://github.com/eleme/react-context-global-store/blob/master/README.zh-CN.md)  

The react-context-global-store is a global state management library built on the React Context API (**React version 16 or above**).Using it you can build a global state repository just like redux and reference these global states in a simple way in your internal business components.It's very small (less than 300 lines after packaging) and has a clean API.

##  Installation

```bash
npm install react-context-global-store
```

## Use It
Wrap your app with the Provider component and initialize your store with createStore:  
*※The first level substore can only be an object, and cannot be an array or other structure. You can use other data structures in the first level substore*

```js
// index.js

import React from 'react';
import ReactDom from 'react-dom';
import { createStore, StoreProvider } from 'react-context-global-store';
import App from './app';

const store = createStore({
  counter: { // The first level of the sub-store must be an object
    val: 0,
    pepols: [{ // The second level substore can be an array or other data structure
      name: 'Helen',
      age: 30,
    }],
  }
});

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('root')
);
```
Then use the connect method to connect your component to the store:
```js
// app.js

import React from 'react';
import { connect } from 'react-context-global-store';

class App extends React.Component {
  
}

export default connect(App, ['counter']);
```
Finally use this.props.store inside the component to get the defined context and update your context with setStore  
*Tips: Just like setState, you can pass in a callback function to get the updated context*
```js
// before

add() {
  const { val, pepols } = this.props.store.counter;
  pepols.push({
    name: 'john',
    age: 23,
  })
  this.props.setStore({
    counter: {
      val: val + 1,
      pepols,
    }
  }, () => {
    console.log(this.props.store.counter.val, this.props.store.counter.pepols); // new context
  });
}

render() {
  const { counter } = this.props.store;
  return (
    <div>
      {counter.val}
      <button onClick={() => this.add()}>add</button>
    </div>
  )
}

// after
```

## Reserved Word
React-context-global-store has some reserved words that you should not modify or use in your program, otherwise it will cause some unexpected errors.

- this.props.store
- this.props.setStore


## Components

**StoreProvider** *Component*

Container component, you need to use this component to wrap your App component when creating an application.  
It receives an initialized Store so that the child component uses the `connect` method to connect the component to the Store.

## APIs

>**connect** *Function*

Use this function to connect components to the Store

Params
  + **component** { ReactComponent } Subcomponents that need to be connected
  + **stores** { Array } Store name set to be obtained

>**setStore** *Function*

Use this function to modify the data in the store

Params
  + **newState** { Object } New state, it will locally update some states like setState
  + **callback** { Function } State updated callback function

>**createStore** *Function*

Use this function to create a Store  
*※The first level substore can only be an object, and cannot be an array or other structure. You can use other data structures in the first level substore*

Params
  + **store** { Object } Store template, a normal object

>**AdapterStore** *Class*

Create an AdapterStore; it will be automatically stored in localized storage such as localStorage after the state updated.  
You can use the injectAdapter function to customize the storage method, or use the localStorage (library comes with) storage.

Params
  + **adapter** { String } Adapter name, the library native support localStorage
  + **values** { Object } Child Store

Example
```js
import { AdapterStore, createStore } from 'react-context-global-store';

const store = createStore({
  counter: new AdapterStore('localStorage', {
    count: 0,
  })
});
```

>**injectAdapter** *Function*

Custom adapter, if localStorage can't meet your needs, you can customize other storage methods.

Params
  + **customAdapter** { Object } Custom storage, custom storage must have a get method and a set method; you can also use it to rewrite localStorage to improve your system performance

Example
```js
import { injectAdapter, AdapterStore, createStore } from 'react-context-global-store';

injectAdapter({
  sessionStorage: {
    get(key) {
      return window.sessionStorage.getItem(key);
    },

    set(key, val) {
      window.sessionStorage.setItem(key, val);
    },
  }
});

const store = createStore({
  caches: new AdapterStore('sessionStorage', {
    count: 0,
  })
});
```
