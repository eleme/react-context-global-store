/* eslint-disable no-console */

export const adapters: any = {
  memory: {
    get() { },
    set() { },
  },
  localStorage: {
    set(name: string, store: any) {
      const data = {
        ...store,
      };
      delete data.set;
      window.localStorage.setItem(name, JSON.stringify(data));
    },

    get(name: string) {
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

export function inject(injectAdapters: any) {
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
