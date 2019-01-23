/* eslint-disable import/prefer-default-export */

// import Provider from './provider';
// import connect from './connect';
// import createStore, { createAdapterStore } from './createStore';
// import { inject } from './adapters';

// export default {
//   connect,
//   Provider,
//   createStore,
//   createAdapterStore,
//   injectAdapter: inject,
// };

import { Adapter } from './createStore';
import { inject } from './adapters';

export { default as StoreProvider } from './provider';
export { default as connect } from './connect';
export { default as createStore } from './createStore';
export const AdapterStore = Adapter;
export const injectAdapter = inject;
