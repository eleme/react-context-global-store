/* eslint-disable react/prop-types */
import React from 'react';
import { adapters } from './adapters';

export default function (name, defaultValue = {}, adapter = 'memory', extractSetStateFunc) {
  const Context = React.createContext(name);

  class ContextHoc extends React.Component {
    constructor(props) {
      super(props);

      if (!adapters[adapter]) {
        throw new Error(`KV Store:\n Uncaught ReferenceError: ${adapter} Adapter is not defined.`);
      }

      const defaultData = {
        ...defaultValue,
        ...adapters[adapter].get(name),
      };

      this.state = {
        ...defaultData,
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
      return (
        <Context.Provider value={this.state}>
          { this.props.children }
        </Context.Provider>
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
