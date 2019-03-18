/* eslint-disable react/prop-types */
import * as React from 'react';
import { adapters } from '../adapters';

export default function (name: string, defaultValue = {}, adapter = 'memory', extractSetStateFunc: Function) {
  const Context = React.createContext({});
  const { Provider } = Context;

  class ContextHoc extends React.Component {
    constructor(props: any) {
      super(props);

      if (!adapters[adapter]) {
        throw new Error(`KV Store:\n Uncaught ReferenceError: ${adapter} Adapter is not defined.`);
      }

      this.state = {
        ...defaultValue,
        ...adapters[adapter].get(name),
      };

      extractSetStateFunc(name, (store: any, callback: Function) => {
        this.setState(store, () => {
          adapters[adapter].set(name, this.state);
          if (typeof callback === 'function') {
            callback(this.state);
          }
        });
      });
    }

    render() {
      return (
        <Provider value={this.state}>
          { this.props.children }
        </Provider>
      );
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
