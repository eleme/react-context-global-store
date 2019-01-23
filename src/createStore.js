import contextFactory from './factory';
import { isType, assign } from './utils';


class Store {
  constructor(defaultData) {
    this.store = defaultData;
    this.updaters = {};
  }

  get data() {
    return this.store;
  }

  update(store, callback) {
    Object.keys(store).map((key) => {
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

export const stores = new Store({});

export class Adapter {
  constructor(adapter, values) {
    this.values = values;
    this.adapter = adapter;
  }
}

export const setStore = (updateStore, callback) => {
  stores.update(updateStore, callback);
};

function extractSetStateFunc(storeName, fn) {
  stores.updaters[storeName] = fn;
}

export default function (storeTemp) {
  if (!isType(storeTemp, 'Object') && !isType(storeTemp, 'Function')) {
    throw new Error(`KV Store:\n TypeError: The argument to the createStore method must be an object or function, But got an ${isType(storeTemp)}.`);
  }

  let waitBoundStore = null;

  if (typeof storeTemp === 'function') {
    waitBoundStore = storeTemp();
  } else {
    waitBoundStore = storeTemp;
  }

  Object.keys(waitBoundStore).map((key) => {
    const nowBuilder = waitBoundStore[key];
    if (nowBuilder instanceof Adapter) {
      stores.data[key] = {
        visitor: contextFactory(key, nowBuilder.values, nowBuilder.adapter, extractSetStateFunc),
        dataCopy: nowBuilder.values,
      };
    } else {
      stores.data[key] = {
        visitor: contextFactory(key, nowBuilder, 'memory', extractSetStateFunc),
        dataCopy: nowBuilder,
      };
    }
    return nowBuilder;
  });

  return stores.data;
}
