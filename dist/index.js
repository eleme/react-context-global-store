(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = global || self, factory(global.index = {}, global.React));
}(this, function (exports, React) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;

  /* eslint-disable no-console */
  const adapters = {
    memory: {
      get() {},

      set() {}

    },
    localStorage: {
      set(name, store) {
        const data = { ...store
        };
        delete data.set;
        window.localStorage.setItem(name, JSON.stringify(data));
      },

      get(name) {
        const data = window.localStorage.getItem(name);

        if (data) {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.warn(e);
          }
        }

        return {};
      }

    }
  };
  function inject(injectAdapters) {
    try {
      Object.keys(injectAdapters).map(key => {
        adapters[key] = injectAdapters[key];
        return adapters[key];
      });
      return adapters;
    } catch (e) {
      console.error(e);
      return adapters;
    }
  }

  /* eslint-disable react/prop-types */
  function contextFactory (name, defaultValue = {}, adapter = 'memory', extractSetStateFunc) {
    const Context = React.createContext(name);

    class ContextHoc extends React.Component {
      constructor(props) {
        super(props);

        if (!adapters[adapter]) {
          throw new Error(`KV Store:\n Uncaught ReferenceError: ${adapter} Adapter is not defined.`);
        }

        const defaultData = { ...defaultValue,
          ...adapters[adapter].get(name)
        };
        this.state = { ...defaultData
        };
        extractSetStateFunc(name, (store, callback) => {
          this.setState(store, () => {
            adapters[adapter].set(name, this.state);

            if (typeof callback === 'function') {
              callback();
            }
          });
        });
      }

      render() {
        return React.createElement(Context.Provider, {
          value: this.state
        }, this.props.children);
      }

    }

    class Factory {
      get ctx() {
        return Context;
      }

      get component() {
        return ContextHoc;
      }

    }

    return new Factory();
  }

  /* eslint-disable no-param-reassign */
  function isType(obj, type) {
    if (type) {
      return Object.prototype.toString.call(obj) === `[object ${type}]`;
    } else {
      return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0];
    }
  }
  function assign(a, b) {
    if (isType(a, 'Object') && isType(b, 'Object')) {
      Object.keys(b).map(key => {
        if (isType(a[key]) !== isType(b[key]) || !isType(a[key], 'Object')) {
          a[key] = b[key];
        } else {
          a[key] = assign(a[key], b[key]);
        }

        return key;
      });
    }

    return a;
  }

  class Store {
    constructor(defaultData) {
      this.store = defaultData;
      this.updaters = {};
    }

    get data() {
      return this.store;
    }

    update(store, callback) {
      Object.keys(store).map(key => {
        if (!this.updaters[key]) {
          throw new Error(`KV Store:\n Uncaught ReferenceError: ${store} Store is not defined.`);
        }

        const newStore = assign(stores.data[key].dataCopy, store[key]);
        stores.data[key].dataCopy = newStore;
        this.updaters[key](newStore, callback);
        return key;
      });
    }

  }

  const stores = new Store({});
  class Adapter {
    constructor(adapter, values) {
      this.values = values;
      this.adapter = adapter;
    }

  }
  const setStore = (updateStore, callback) => {
    stores.update(updateStore, callback);
  };

  function extractSetStateFunc(storeName, fn) {
    stores.updaters[storeName] = fn;
  }

  function createStore (storeTemp) {
    if (!isType(storeTemp, 'Object') && !isType(storeTemp, 'Function')) {
      throw new Error(`KV Store:\n TypeError: The argument to the createStore method must be an object or function, But got an ${isType(storeTemp)}.`);
    }

    let waitBoundStore = null;

    if (typeof storeTemp === 'function') {
      waitBoundStore = storeTemp();
    } else {
      waitBoundStore = storeTemp;
    }

    Object.keys(waitBoundStore).map(key => {
      const nowBuilder = waitBoundStore[key];

      if (nowBuilder instanceof Adapter) {
        stores.data[key] = {
          visitor: contextFactory(key, nowBuilder.values, nowBuilder.adapter, extractSetStateFunc),
          dataCopy: nowBuilder.values
        };
      } else {
        stores.data[key] = {
          visitor: contextFactory(key, nowBuilder, 'memory', extractSetStateFunc),
          dataCopy: nowBuilder
        };
      }

      return nowBuilder;
    });
    return stores.data;
  }

  /* eslint-disable react/prop-types */

  class Providers extends React.Component {
    loopContext(ctxs) {
      if (ctxs.length) {
        const Ctx = ctxs.shift();
        return React.createElement(Ctx.visitor.component, null, this.loopContext(ctxs));
      } else {
        return React.createElement(React.Fragment, null, this.props.children);
      }
    }

    render() {
      const Ctxs = Object.keys(this.props.store).map(ctx => this.props.store[ctx]);
      return this.loopContext(Ctxs);
    }

  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function connect (Component, contextArgs) {
    return class ConnectionHoc extends React.Component {
      constructor(props) {
        super(props);
        this.contexts = {};
      }

      renderContext(ctxs) {
        const CtxName = ctxs.shift();

        if (CtxName) {
          if (!stores.data[CtxName]) {
            throw new Error(`KV Store:\n Uncaught ReferenceError: ${CtxName} Context is not defined.`);
          }

          const Ctx = stores.data[CtxName];
          return React.createElement(Ctx.visitor.ctx.Consumer, null, data => {
            this.contexts[CtxName] = data;
            return this.renderContext(ctxs);
          });
        } else {
          if (this.props.store !== undefined || this.props.setStore !== undefined) {
            throw new Error('KV Store:\n Error: Keyword store and setStore are reserved words. Check your props and replace them with other keys.');
          }

          return React.createElement(Component, _extends({
            setStore: setStore,
            store: this.contexts
          }, this.props));
        }
      }

      render() {
        return React.createElement(React.Fragment, null, this.renderContext([...contextArgs]));
      }

    };
  }

  /* eslint-disable import/prefer-default-export */
  const AdapterStore = Adapter;
  const injectAdapter = inject;

  exports.AdapterStore = AdapterStore;
  exports.injectAdapter = injectAdapter;
  exports.StoreProvider = Providers;
  exports.connect = connect;
  exports.createStore = createStore;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
