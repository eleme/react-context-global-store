# react-context-global-store

[![NPM version](https://img.shields.io/npm/v/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)
[![NPM size](https://img.shields.io/bundlephobia/min/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)
[![NPM downloads](https://img.shields.io/npm/dt/react-context-global-store.svg)](https://www.npmjs.org/package/react-context-global-store)

## 简介

react-context-global-store是一个基于React Context API(**需要React 16及以上版本**)构建的全局状态管理库。  
使用它你可以像使用redux一样构建全局状态仓库，并在你的内部业务组件中通过简单的方式引用这些全局状态。
它的体积非常小(打包后仅有不到300行)，且拥有简洁的API。

## 安装

```bash
npm install react-context-global-store
```

## 使用
使用StoreProvider组件包装你的App，并使用createStore初始化你的store  
*※第一级子store只能是对象，不能为数组等其它结构。你可以在第一级子store中使用其它数据结构*

```js
// index.js

import React from 'react';
import ReactDom from 'react-dom';
import { createStore, StoreProvider } from 'react-context-global-store';
import App from './app';

const store = createStore({
  counter: { // 第一级子store必须是对象
    val: 0,
    pepols: [{ // 第二级子store可以是数组等其它数据结构
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
然后使用connect方法将你的组件与store连接：
```js
// app.js

import React from 'react';
import { connect } from 'react-context-global-store';

class App extends React.Component {
  constructor(props) {
    super(props)
  }
}

export default connect(App, ['counter']);
```
最后在组件内使用this.props.store获取定义好的context，并使用setStore更新你的context  
*Tips: 就像setState一样，你可传入回调函数来获取更新后的context*
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
react-context-global-store有一些保留字，你不应该在你的程序中修改或占用它们，否则会导致一些意外的错误

- this.props.store
- this.props.setStore


## Components

**StoreProvider** *Component*

容器组件，你需要在创建应用时，使用这个组件包裹你的App组件。  
它接收一个初始化的Store，以便子组件使用`connect`方法连接组件与Store

## APIs

>**connect** *Function*

使用此方法连接组件与Store

Params
  + **component** { ReactComponent } 需要连接的子组件
  + **stores** { Array } 需要获取的Store名集合


>**setStore** *Function*

使用此方法修改Store中的state

Params
  + **newState** { Object } 新的state，它会像setState一样局部更新某些state
  + **callback** { Function } state更新后的回调


>**createStore** *Function*

使用此方法创建Store  
*※第一级子store只能是对象，不能为数组等其它结构。你可以在第一级子store中使用其它数据结构*

Params
  + **store** { Object } store模板，一个普通对象


>**AdapterStore** *Class*

创建一个AdapterStore；它会在状态更新后，自动存储在localStorage等本地化存储中。  
你可以使用injectAdapter方法自定义存储方式，或使用localStorage(库自带)存储。

Params
  + **adapter** { String } adapter名，库原生支持localStorage
  + **values** { Object } 子store

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

自定义adapter，如果localStorage无法满足你的需求，你可以自定义其它的存储方式。

Params
  + **customAdapter** { Object } 自定义的存储方式，自定义的存储方式必须有一个get方法和一个set方法；你也可以用它重写localStorage以提高你的系统性能

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
})

const store = createStore({
  caches: new AdapterStore('sessionStorage', {
    count: 0,
  })
});
```
