import { Adapter } from './store';
import { inject } from './adapters';

export { default as StoreProvider } from './components/provider';
export { default as connect } from './components/connect';
export { default as createStore } from './store';
export const AdapterStore = Adapter;
export const injectAdapter = inject;
export { setStore, getStore } from './store';
