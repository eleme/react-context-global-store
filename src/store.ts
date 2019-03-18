import contextFactory from './components/factory';
import { isType, assign } from './utils';

interface StoreInterface {
  store: any;
  updaters: any[]
}

class Store implements StoreInterface{
  store: any
  updaters: any
  constructor(defaultData: any) {
    this.store = defaultData;
    this.updaters = {};
  }

  get data() : any {
    return this.store;
  }

  update(store: any, callback: Function) {
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

interface AdapterInterface {
  values: string
  adapter: any
}
export class Adapter implements AdapterInterface{
  values: string
  adapter: any
  constructor(adapter: string, values: any) {
    this.values = values;
    this.adapter = adapter;
  }
}

export const setStore = function (updateStore: any, callback: Function) : void {
  stores.update(updateStore, callback);
};

export const getStore = function (key: string) : any {
  return stores.data[key];
}

const extractSetStateFunc : (storeName: string, fn: Function) => void = function(storeName: string, fn: Function) {
  stores.updaters[storeName] = fn;
}

export default function (storeTemp: any) {
  if (!isType(storeTemp, 'Object') && !isType(storeTemp, 'Function')) {
    throw new Error(`KV Store:\n TypeError: The argument to the createStore method must be an object or function, But got an ${isType(storeTemp)}.`);
  }

  let waitBoundStore: any = null;

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
