import * as React from 'react';

import { stores, setStore } from '../store';

interface Props {
  store?: any;
  setStore?: any;
}

export default function (Component: React.ComponentClass<any>, contextArgs: string[]) {
  return class ConnectionHoc extends React.Component<Props, {}, any> {
    contexts: any = {}

    renderContext(ctxs: string[], cacheLen: number) {
      const CtxLen: number = (typeof cacheLen === 'number' && !isNaN(cacheLen)) ? cacheLen : ctxs.length - 1;
      const CtxName: string = ctxs[CtxLen - 1];

      return ((ctxname: string, len: number) => {
        if (ctxname && len >= 0) {
          if (!stores.data[ctxname]) {
            throw new Error(`KV Store:\n Uncaught ReferenceError: ${CtxName} Context is not defined.\nPlease check the connect method of the wrapped ${Component.prototype.constructor.name} component.`);
          }

          const Ctx = stores.data[ctxname];
          return (
            <Ctx.visitor.ctx.Consumer name={ctxname}>
              {
                (data: any) => {
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
            this.renderContext([...contextArgs], contextArgs.length)
          }
        </>
      );
    }
  };
}
