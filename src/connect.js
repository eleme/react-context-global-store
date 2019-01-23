import React from 'react';

import { stores, setStore } from './createStore';

export default function (Component, contextArgs) {
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
        return (
          <Ctx.visitor.ctx.Consumer>
            {
              (data) => {
                this.contexts[CtxName] = data;
                return this.renderContext(ctxs);
              }
            }
          </Ctx.visitor.ctx.Consumer>
        );
      } else {
        if (this.props.store !== undefined || this.props.setStore !== undefined) {
          throw new Error('KV Store:\n Error: Keyword store and setStore are reserved words. Check your props and replace them with other keys.');
        }

        return <Component setStore={setStore} store={this.contexts} {...this.props} />;
      }
    }

    render() {
      return (
        <>
          {
            this.renderContext([...contextArgs])
          }
        </>
      );
    }
  };
}
