/* eslint-disable no-console */

export const adapters = {
  memory: {
    get() { },
    set() { },
  },
  localStorage: {
    set(name, store) {
      const data = {
        ...store,
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
    },
  },
};

export function inject(injectAdapters) {
  try {
    Object.keys(injectAdapters).map((key) => {
      adapters[key] = injectAdapters[key];
      return adapters[key];
    });
    return adapters;
  } catch (e) {
    console.error(e);
    return adapters;
  }
}
