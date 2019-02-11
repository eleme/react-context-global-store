import React from 'react';

import { stores, setStore } from './createStore';

export default function (Component, contextArgs) {
  return class ConnectionHoc extends React.Component {
    constructor(props) {
      super(props);
      this.contexts = {};
    }

    renderContext(ctxs, cacheLen) {
      const CtxLen = (typeof cacheLen === 'number' && !isNaN(cacheLen)) ? cacheLen : ctxs.length - 1;
      const CtxName = ctxs[CtxLen];

      return ((ctxname, len) => {
        if (ctxname && len >= 0) {
          if (!stores.data[ctxname]) {
            throw new Error(`KV Store:\n Uncaught ReferenceError: ${CtxName} Context is not defined.`);
          }

          const Ctx = stores.data[ctxname];
          return (
            <Ctx.visitor.ctx.Consumer name={ctxname}>
              {
                (data) => {
                  this.contexts[CtxName] = data;
                  return this.renderContext(ctxs, len - 1);
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
      })(CtxName, CtxLen);
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
